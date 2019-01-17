import Cookies from 'js-cookie'
// cookie保存的天数
import config from '@/config'
import { forEach, hasOneOf, objEqual } from '@/libs/tools'
const { title, cookieExpires, useI18n } = config

export const TOKEN_KEY = 'token'

export function setToken(token){
		Cookies.set(TOKEN_KEY,token),{ expires: cookieExpires || 1 };
}
export function getToken(){
		const token = Cookies.get(TOKEN_KEY);
		if(token) return token
		else return false
}

export const hasChild = (item) => {
  return item.children && item.children.length !== 0
}

const showThisMenuEle = (item, access) => {
  if (item.meta && item.meta.access && item.meta.access.length) {
    if (hasOneOf(item.meta.access, access)) return true
    else return false
  } else return true
}

/**
 * @param {*} access 用户权限数组，如 ['super_admin', 'admin']
 * @param {*} route 路由列表
 */
const hasAccess = (access, route) => {
	if(route.meta && route.meta.access) return hasOneOf(access, route.meta.access)
	else return true
}

/**
 * 权鉴
 * @param {*} name 即将跳转的路由name
 * @param {*} access 用户权限数组
 * @param {*} routes 路由列表
 * @description 用户是否可跳转到该页
 */
export const canTurnTo = (name, access, routes) => {
	const routePermissionJudge = (list) => {
		return list.some(item => {
			if(item.children && item.children.length){
				return routePermissionJudge(item.children)
			}else if(item.name === name){
				return hasAccess(access, item)
			}
		})
	}
	return routePermissionJudge(routes)
}

/**
 * @param {Array} list 通过路由列表得到菜单列表
 * @returns {Array}
 */
export const getMenuByRouter = (list, access) => {
	let res = []
	forEach(list, item => {
		if(!item.meta || (item.meta && !item.meta.hideInMenu)){
			let obj = {
				icon:(item.meta && item.meta.icon) || '',
				name:item.name,
				meta:item.meta
			}
			if ((hasChild(item) || (item.meta && item.meta.showAlways)) && showThisMenuEle(item, access)) {
        obj.children = getMenuByRouter(item.children, access)
			}
			if (item.meta && item.meta.href) obj.href = item.meta.href
      if (showThisMenuEle(item, access)) res.push(obj)
		}
	})
	return res
}

export const getRouteTitleHandled = (route) => {
  let router = { ...route }
  let meta = { ...route.meta }
  let title = ''
  if (meta.title) {
    if (typeof meta.title === 'function') {
      meta.__titleIsFunction__ = true
      title = meta.title(router)
    } else title = meta.title
  }
  meta.title = title
  router.meta = meta
  return router
}

export const showTitle = (item, vm) => {
  let { title, __titleIsFunction__ } = item.meta
  if (!title) return
  // if (useI18n) {
		if (false) {
    if (title.includes('{{') && title.includes('}}') && useI18n) title = title.replace(/({{[\s\S]+?}})/, (m, str) => str.replace(/{{([\s\S]*)}}/, (m, _) => vm.$t(_.trim())))
    else if (__titleIsFunction__) title = item.meta.title
    else title = vm.$t(item.name)
  } else title = (item.meta && item.meta.title) || item.name
  return title
}

/**
 * @description 根据当前跳转的路由设置显示在浏览器标签的title
 * @param {Object} routeItem 路由对象
 * @param {Object} vm Vue实例
 */
export const setTitle = (routeItem, vm) => {
	const handleRoute = getRouteTitleHandled(routeItem)
	const pageTitle = showTitle(handleRoute)
	const resTitle = pageTitle ? `${title} - ${pageTitle}` : title
	window.document.title = resTitle
}

/**
 * @param {String} url
 * @description 从URL中解析参数
 */
export const getParams = url => {
	const keyValueArray = url.split('?')[1].split('&')
	const paramObj = {}
	keyValueArray.forEach(itenm => {
		const keyValue = item.split('=')
		paramObj[keyValue[0]] = keyValue[1]
	});
	return paramObj
}

export const findNodeUpperByClasses = (ele, classes) => {
  let parentNode = ele.parentNode
  if (parentNode) {
    let classList = parentNode.classList
    if (classList && classes.every(className => classList.contains(className))) {
      return parentNode
    } else {
      return findNodeUpperByClasses(parentNode, classes)
    }
  }
}