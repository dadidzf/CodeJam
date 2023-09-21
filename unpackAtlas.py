# -*- coding: utf-8 -*-
import os
import sys
import os.path
import shutil
from PIL import Image


def gen_png_from_plist(atlasName, pngName):
    fileName = atlasName.replace('.atlas', '')
    print(pngName, atlasName)

    big_image = Image.open(pngName)
    atlas = open(atlasName, encoding="utf8")

    # big_image.show()#调用系统看图器

    curPath = os.getcwd()  # 当前路径
    aim_path = os.path.join(curPath, fileName)
    print(aim_path)
    if os.path.isdir(aim_path):
        shutil.rmtree(aim_path, True)  # 如果有该目录,删除
    os.makedirs(aim_path)

    while True:
        line = atlas.readline()
        if (line.startswith('repeat:')):
            break

    nameMapCnt = {}

    # 读取文件中与解包无关的前几行字符串
    while True:
        line1 = atlas.readline()  # name
        if len(line1) == 0:
            break
        else:
            line2 = atlas.readline()  # rotate
            line3 = atlas.readline()  # xy
            line4 = atlas.readline()  # size
            line5 = atlas.readline()  # orig
            line6 = atlas.readline()  # offset
            line7 = atlas.readline()  # index

            print("文件名:"+line1, end="")
            print("是否旋转:"+line2, end="")
            print("坐标:"+line3, end="")
            print("大小:"+line4, end="")
            print("原点:"+line5, end="")
            print("阻挡:"+line6, end="")
            print("索引:"+line7, end="")

            name = line1.replace("\n", "")

            args = line4.split(":")[1].split(",")
            width = int(args[0])
            height = int(args[1])

            args = line3.split(":")[1].split(",")
            ltx = int(args[0])
            lty = int(args[1])

            if (line2 == '  rotate: true\n'):
                rbx = ltx+height
                rby = lty+width
            else:
                rbx = ltx+width
                rby = lty+height

            print("文件名："+name+" 宽度："+str(width)+" 高度："+str(height)+" 起始横坐标：" +
                  str(ltx)+" 起始纵坐标："+str(lty)+" 结束横坐标："+str(rbx)+" 结束纵坐标："+str(rby)+"\n")
            if (line2 == '  rotate: true\n'):
                result_image = Image.new("RGBA", (height, width), (0, 0, 0, 0))
                rect_on_big = big_image.crop((ltx, lty, rbx, rby))
                result_image.paste(rect_on_big, (0, 0, height, width))
            else:
                result_image = Image.new("RGBA", (width, height), (0, 0, 0, 0))
                rect_on_big = big_image.crop((ltx, lty, rbx, rby))
                result_image.paste(rect_on_big, (0, 0, width, height))

            name_t = name.replace("/", "_")  # 字符替换
            if (nameMapCnt.get(name_t)):
                nameMapCnt[name] += 1
                name_t = str(name_t) + "_" + str(nameMapCnt[name])
            else:
                nameMapCnt[name] = 1

            name_t += ".png"
            if (line2 == '  rotate: true\n'):
                result_image = result_image.transpose(Image.ROTATE_270)
            result_image.save(aim_path+'/'+name_t)
    atlas.close()
    del big_image


def unPackone(curDir, filename):
    print('解压文件', curDir, filename)
    atlas_filename = os.path.join(curDir, filename + '.atlas')
    png_filename = os.path.join(curDir, filename + '.png')
    dir_name = os.path.join(curDir, filename)
    if os.path.exists(dir_name):
        print('the plist file %s is already unpacked, the dir %s is already exist !' % (
            atlas_filename, dir_name))
    elif (os.path.exists(atlas_filename) and os.path.exists(png_filename)):
        gen_png_from_plist(atlas_filename, png_filename)
    else:
        print('make sure you have both plist %s \
        and png %s files in the same directory' % (atlas_filename, png_filename))


def get_current_path():
    return os.path.split(os.path.realpath(__file__))[0]


def process(curDir):
    plistFileList = []
    for filename in os.listdir(curDir):
        f = os.path.join(curDir, filename)
        if os.path.isfile(f):
            if os.path.splitext(f)[1] == ".atlas":
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
