(function(win){
	'use strict';
	
	if(win.define){
		return;
	}	
	//是否为函数
	var isFunction = function (obj) {
		return Object.prototype.toString.call(obj) === '[object Function]';
	}
	//get script
	var initModName = null
	, script = win.document.getElementsByTagName('script')
	, dataMain;
	//get dataMain
	for(var i=0;i<script.length && !initModName;i++){
		dataMain = script[i].getAttribute('data-main').split('/');
		initModName = dataMain[dataMain.length-1];
	}
	//not have dataMain
	if(!initModName){
		throw new Error('缺少入口函数');
	}
	//create main.js
	var cScript = win.document.createElement('script');
	cScript.src = dataMain.join('/')+'.js';
	win.document.body.appendChild(cScript);
	// require,tempObj
	var require
	, tempObj={};
	
	var runModel = function(name){
		var exports = {};
		var mod = tempObj[name];

		if(!isFunction(mod.factory)) {
			mod.ret = mod.factory;
		}else{
			//模块未实现
			var ret = tempObj[name].factory.apply(undefined, [require, exports, undefined]); 
			mod.ret = ret === undefined ? exports : ret;
			
		}
		mod.inited = true;
	}
	
	require = function (name){
		if(!tempObj[name]){
			throw new Error(name + ' not define');
		}
		var mod = tempObj[name];

		if(mod.inited === false){
			runModel(name);
		}

		return mod.ret;
	}
	

	var define = function (name, deps, factory){
		if(tempObj[name]){
			throw new Error(name + ' not define');
		}
		if(isFunction(name)){
			factory = name;
		}
		if(isFunction(deps)) {
			factory = deps;
		}
		tempObj[name] = {
			factory : factory,
			inited  : false
		};
		factory();
		if(name === initModName){
			runModel(name);
		}
		return tempObj;
	}
	win.define = define;
}(this))
