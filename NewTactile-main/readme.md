# bug记录

## UI 
1. 各个bar用的都是absolute定位有点愚蠢

### header：
1. centerbox中图标尺寸好像没统一，new page被裁剪了，undo，redo那里横向很长

### toolbar
1. 逻辑有待修改：我现在是将图标和文字算作一个unit然后均匀排列，但需要专门调整auto layout这种文字较多的；图片和文字的对齐用padding是不是有点问题？

### leftbar
1. 滑杆没加
