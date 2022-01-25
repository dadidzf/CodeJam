#!/usr/bin/env python
# -*- coding: utf8 -*-

import os
import sys
from PIL import Image
from xml.etree import ElementTree

def tree_to_dict(tree):
    d = {}
    for index, item in enumerate(tree):
        if item.tag == 'key':
            if tree[index+1].tag == 'string':
                d[item.text] = tree[index + 1].text
            elif tree[index + 1].tag == 'true':
                d[item.text] = True
            elif tree[index + 1].tag == 'false':
                d[item.text] = False
            elif tree[index+1].tag == 'dict':
                d[item.text] = tree_to_dict(tree[index+1])
    return d 
    
def gen_png_from_plist(plist_filename, png_filename):
    file_path = plist_filename.replace('.plist', '')
    big_image = Image.open(png_filename)
    root = ElementTree.fromstring(open(plist_filename, encoding='utf8').read())
    plist_dict = tree_to_dict(root[0])
    to_list = lambda x: x.replace('{','').replace('}','').split(',')
    if not 'frames' in plist_dict:
        return
    for k,v in plist_dict['frames'].items():
        print ("------------------------- 图片名字", k)
        if 'textureRect' in v:
            rectlist = to_list(v['textureRect'])
        elif 'frame' in v:
            rectlist = to_list(v['frame'])

        if ('rotated' in v):
            isRotated = v['rotated']  
            if isinstance(v['rotated'], str):
                isRotated = v['rotated'] == "true"

            width = int( rectlist[3] if isRotated else rectlist[2] )
            height = int( rectlist[2] if isRotated else rectlist[3] )        
        elif ('textureRotated' in v):
            isRotated = v['textureRotated']  
            if isinstance(v['textureRotated'], str):
                isRotated = v['textureRotated'] == "true"

            width = int( rectlist[3] if isRotated else rectlist[2] )
            height = int( rectlist[2] if isRotated else rectlist[3] )
        else:
            width = int( rectlist[2] )
            height = int( rectlist[3] )
        box=( 
            int(rectlist[0]),
            int(rectlist[1]),
            int(rectlist[0]) + width,
            int(rectlist[1]) + height,
            )
        #print box
        #print v
        if 'spriteSize' in v:
            spriteSize = v['spriteSize']
        elif 'sourceSize' in v:
            spriteSize = v['sourceSize']
            
        sizelist = [ int(x) for x in to_list(spriteSize)]
        #print sizelist
        rect_on_big = big_image.crop(box)

        if ('textureRotated' in v and v['textureRotated']) or ('rotated' in v and v['rotated']):
            #rect_on_big = rect_on_big.rotate(90)
            rect_on_big = rect_on_big.transpose(Image.ROTATE_90)

        result_image = Image.new('RGBA', sizelist, (0,0,0,0))
        
        if ('textureRotated' in v and v['textureRotated']) or ('rotated' in v and v['rotated']):
            result_box=(
                int(( sizelist[0] - height )/2),
                int(( sizelist[1] - width )/2),
                int(( sizelist[0] + height )/2),
                int(( sizelist[1] + width )/2)
                )
        else:
            result_box=(
                int(( sizelist[0] - width )/2),
                int(( sizelist[1] - height )/2),
                int(( sizelist[0] + width )/2),
                int(( sizelist[1] + height )/2)
                )

        print(rect_on_big, result_box)
        result_image.paste(rect_on_big, result_box, mask=0)

        if not os.path.isdir(file_path):
            os.mkdir(file_path)
        k = k.replace('/', '_')
        outfile = (file_path+'/' + k).replace('gift_', '')
        #print k
        if outfile.find('.png') == -1:
            outfile = outfile + '.png'
        #print outfile, "generated"
        result_image.save(outfile)

def get_current_path():
    return os.path.split(os.path.realpath(__file__))[0]

def unPackone(curDir, filename):
    print ('解压文件', curDir, filename)
    plist_filename = os.path.join(curDir, filename + '.plist')
    png_filename = os.path.join(curDir, filename + '.png')
    dir_name = os.path.join(curDir, filename)
    if os.path.exists(dir_name):
        print ('the plist file %s is already unpacked, the dir %s is already exist !' % (plist_filename, dir_name))
    elif (os.path.exists(plist_filename) and os.path.exists(png_filename)):
        gen_png_from_plist(plist_filename, png_filename)
    else:
        print ('make sure you have both plist %s \
        and png %s files in the same directory' % (plist_filename, png_filename))

def process(curDir):
    plistFileList = []
    for filename in os.listdir(curDir):
        f = os.path.join(curDir, filename)
        if os.path.isfile(f):
            if os.path.splitext(f)[1] == ".plist" :
                name = os.path.splitext(filename)[0]
                unPackone(curDir, name)
        elif os.path.isdir(f):
            process(f)

if __name__ == '__main__':
    curDir = get_current_path()
    if len(sys.argv) > 1 and os.path.isdir(sys.argv[1]):
        process(os.path.abspath(sys.argv[1]))
    else:
        process(curDir) 
