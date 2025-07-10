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
        required_cjk_chars = set()
        for char in content:
            codepoint = ord(char)
            # 判断是否为CJK字符 (Unicode范围)
            if (0x4E00 <= codepoint <= 0x9FFF) or \
               (0x3400 <= codepoint <= 0x4DBF) or \
               (0x20000 <= codepoint <= 0x2A6DF) or \
               (0x2A700 <= codepoint <= 0x2B73F) or \
               (0x2B740 <= codepoint <= 0x2B81F) or \
               (0x2B820 <= codepoint <= 0x2CEAF) or \
               (0xF900 <= codepoint <= 0xFAFF) or \
               (0x2F800 <= codepoint <= 0x2FA1F):
                required_cjk_chars.add(codepoint)
    
    print(f"找到 {len(required_cjk_chars)} 个唯一CJK字符需要保留")
    
    # 2. 打开字体文件
    font = fontforge.open(input_font)
    
    # 3. 仅对CJK字符进行裁剪处理
    cjk_ranges = [
        (0x4E00, 0x9FFF),    # 基本CJK统一表意文字
        (0x3400, 0x4DBF),    # CJK扩展A
        (0x20000, 0x2CEAF),  # CJK扩展B-F
        (0xF900, 0xFAFF),    # 兼容表意文字
        (0x2F800, 0x2FA1F)   # 兼容表意文字补充
    ]
    
    # 先取消所有选择
    font.selection.none()
    
    # HINDI_RANGES = [
    #     (0x0900, 0x097F),  # 基本梵文字母
    #     (0xA8E0, 0xA8FF),  # 梵文扩展-A
    #     (0x1CD0, 0x1CFF),  # 吠陀扩展
    #     (0x0964, 0x0965),  # 印地语标点符号
    #     (0x0020, 0x007F)   # 基本ASCII（空格、标点、数字）
    # ]
    
    # 选择所有不在CJK范围内的字符（自动保留）
    for start, end in cjk_ranges:
        font.selection.select(("more", "ranges", "unicode"), start, end)
    font.selection.invert()  # 现在选中了所有非CJK字符

    # 选择所有需要保留的CJK字符
    for codepoint in required_cjk_chars:
        try:
            if font[codepoint] is not None:
                font.selection.select(("more", None), codepoint)
        except ValueError:
            print(f"忽略无效的Unicode码点: U+{codepoint:04X}")
    
    # 4. 处理CJK字符：删除未使用的CJK字符
    font.selection.invert()  # 重新选中CJK字符
    font.clear()
    # for glyph in list(font.selection.byGlyphs):  # 创建副本以便安全迭代
    #     if glyph.unicode not in required_cjk_chars:
    #         font.removeGlyph(glyph)
    
    # 5. 生成新字体（保留所有OpenType特性）
    flags = ("opentype", "PfEd-lookups", "dummy-dsig")
    font.generate(output_font, flags=flags)
    print(f"成功生成字体: {output_font}")
    print("注意: 仅裁剪了CJK字符，所有其他字符保持不变")

subset_cjk_only("C:/Users/dengz/Downloads/Noto_Sans-Bold.ttf", "C:/Users/dengz/Downloads/font/Noto_Sans-Bold.txt", "C:/Users/dengz/Downloads/font/oo.ttf")