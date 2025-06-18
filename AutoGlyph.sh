#!/bin/bash
echo "脚本开始执行 $0"
dir=$(dirname "$0")
/opt/homebrew/bin/node /Users/herofight/Work/OtherPrj/CodeJam/GlyphAutoMake.js $current_path $dir

read -p "按任意键继续"
