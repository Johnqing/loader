(function(global, undefined){
    var noop = function(){},
        fileMap = {}, //文件路径
        moduleMap = {};//模块储存
    function isType(type){
        return function(obj){
            return Object.prototype.toString.call(obj) === '[object '+ type +']';
        }
    }
    var isObject = isType('Object'),
        isString = isType('String'),
        isArray = isType('Array'),
        isFunction = isType('Function');
    /**
     *
     * @param id
     * @param dependencies
     * @param factory
     * @returns {*}
     */
    function define(id, dependencies, factory){
        //如果不存在模块 就构建一个新的，存在的话 就返回
        if(!moduleMap[id]){
            var module = {
                id: id,
                dependencies: dependencies,
                factory: factory
            }
            moduleMap[id] = module;
        }
        return moduleMap[id];
    }

    /**
     * 获取依赖
     * @param id
     * @returns {*}
     */
    function use(id){
        var module = moduleMap[id];
        if(!module.entity){
            var args = [];
            for(var i=0; i<module.dependencies.length; i++){
                var dep = module.dependencies[i],
                    entity = moduleMap[dep].entity;
                if(entity){
                    args.push(entity);
                }else{
                    args.push(this.use(dep));
                }
            }
            module.entity = module.factory.apply(noop, args);
        }
        return module.entity;
    }

    /**
     * 加载模块
     * @param path
     * @param callback
     */
    function require(path, callback){
        var pathArr = [];
        if(isString(path)){
            pathArr.push(path);
        }
        if(isArray(path)){
            pathArr = path;
        }
        addScript(pathArr, callback);
    }
    function addScript(pathArr, callback){
        for (var i = 0; i < pathArr.length; i++) {
           var path = pathArr[i];

           if (!fileMap[path]) {
               var head = document.getElementsByTagName('head')[0];
               var node = document.createElement('script');
               node.type = 'text/javascript';
               node.async = 'true';
               node.src = path + '.js';
               node.onload = function () {
                   fileMap[path] = true;
                   head.removeChild(node);
                   checkAllFiles(path, callback);
               };
               head.appendChild(node);
           }
        }
    }
    function checkAllFiles(path, callback){
        for (var i = 0; i < path.length; i++) {
            if (!fileMap[path[i]]) {
                allLoaded = false;
                break;
            }
        }

        if (allLoaded) {
            callback();
        }
    }
    global.require = require;
    global.use = use;
    global.define = define;
}(this));
