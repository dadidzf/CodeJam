import fontforge

def subset_cjk_only(input_font, text_file, output_font):
    """
    仅裁剪字体中的CJK字符，保留所有其他字符
    
    参数:
        input_font: 输入字体文件路径
        text_file: 包含目标CJK文本的UTF-8编码文件
        output_font: 输出字体文件路径
    """
    # 1. 读取文本文件获取所有唯一CJK字符
    with open(text_file, 'r', encoding='utf-8') as f:
        content = f.read()
        all_used_chars = set()
        for char in content:
            codepoint = ord(char)
            all_used_chars.add(codepoint)
            # if (0x4E00 <= codepoint <= 0x9FFF) or \
            #    (0x3400 <= codepoint <= 0x4DBF) or \
            #    (0x20000 <= codepoint <= 0x2A6DF) or \
            #    (0x2A700 <= codepoint <= 0x2B73F) or \
            #    (0x2B740 <= codepoint <= 0x2B81F) or \
            #    (0x2B820 <= codepoint <= 0x2CEAF) or \
            #    (0xF900 <= codepoint <= 0xFAFF) or \
            #    (0x2F800 <= codepoint <= 0x2FA1F):
            #     required_cjk_chars.add(codepoint)
    
    #print(f"找到 {len(required_cjk_chars)} 个唯一CJK字符需要保留")
    
    # 2. 打开字体文件
    font = fontforge.open(input_font)
    
    
    # 先取消所有选择
    font.selection.none()
    
    # 3. 仅对CJK字符进行裁剪处理
    cjk_ranges = [
        (0x4E00, 0x9FFF),    # 基本CJK统一表意文字
        (0x3400, 0x4DBF),    # CJK扩展A
        (0x20000, 0x2CEAF),  # CJK扩展B-F
        (0xF900, 0xFAFF),    # 兼容表意文字
        (0x2F800, 0x2FA1F)   # 兼容表意文字补充
    ]

    HINDI_RANGES = [
        (0x0900, 0x097F),  # 基本梵文字母
        (0xA8E0, 0xA8FF),  # 梵文扩展-A
        (0x1CD0, 0x1CFF),  # 吠陀扩展
        (0x0964, 0x0965),  # 印地语标点符号
        (0x0020, 0x007F)   # 基本ASCII（空格、标点、数字）
    ]
    
    # 遍历所有 glyph
    for glyph in font.glyphs():
        # 检查 glyph 是否有 Unicode 编码且值得输出
        if glyph.unicode != -1 and glyph.isWorthOutputting():
            codepoint = glyph.unicode
            if  (0xA8E0<= codepoint <= 0xA8FF) or  \
                (0x1CD0<= codepoint <= 0x1CFF) or \
                (0x0964 <= codepoint <= 0x0965) or \
                (0x0020<= codepoint <= 0x007F):
                {
                    
                }
                # 啥都不做
            else:
                if (codepoint not in all_used_chars):
                    font.selection.select(("more", 'unicode'), codepoint)
                   
    font.clear()

    # # 优化轮廓
    # font.simplify(0.3, ("ignoreslopes", "ignoreextrema"))
    # font.removeOverlap()
    # font.canonicalContours()
    # font.canonicalStart()

    # # 生成精简TTF
    # font.generate(output_font, 
    #          flags=("round", "no-flex", "omit-instructions", "short-post"))
    
    # 5. 生成新字体（保留所有OpenType特性）
    #flags = ("opentype", "PfEd-lookups", "dummy-dsig")
    #font.generate(output_font, flags=flags)
    font.generate(output_font)
    print(f"成功生成字体: {output_font}")

subset_cjk_only("C:/Users/dengz/Downloads/fontforge/Noto_Sans-Bold.ttf", "C:/Users/dengz/Downloads/fontforge/Noto_Sans-Bold.txt", "C:/Users/dengz/Downloads/fontforge/output/Noto_Sans-Bold.ttf")