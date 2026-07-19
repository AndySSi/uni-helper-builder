node v:21.7.3
npm v:10.5.0

# Script

调试：npm run dev
打包：npm run build

# 目录结构

以单条命令为例

- domain/
  - ast: 构建所生成的代码模板
  - builders: 构建代码目录结构
  - commands: 当前命令执行流程

# 调试

调试过程中将该项目克隆至对应项目的根目录下

以video-frontend-qa-c为例：

1. 在快应用项目下src同级目录中执行 `git clone xxx/frontend-core-kits`
2. 在package.json的script字段中添加`"code": "brc"`
3. 运行dev，找到node_modules下的`@shivip/build-code`，替换dist目录
4. 执行`npm run code`

# 打包

1. 修改webpack.config.cjs文件中mode字段为`production`
2. npm run build

# 发布

1. 本地终端执行`npm login`跳转登录shivip的npm账户
2. 删除dist目录执行build命令打包
3. 修改package.json中的版本号
4. 执行`npm publish access public`发布

# 注意项

- 多项目迭代时需及时提交代码确保各项目下当前插件保持一致
- 发布新版本后需要将webpack.config.cjs文件中mode字段修改为`development`，因`production`模式下编译耗时较长
- 修改完dto中的内容后，需验证当前支持类型所生成代码的准确性
- 若需要修改生成文件或代码的命名规范可在`src/_constants/configuration`中调整
- [babel ast参考](https://astexplorer.net/)
- [TS ast参考](https://ts-ast-viewer.com/)
