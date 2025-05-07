/**
 * @Author Li XuSheng {xs.li1994@outlook.com}
 * @Date 2022/5/18
 * @Since version-1.0
 * @Description 说明
 * @File src/utils setBaseFontSize.ts
 * @Update [2022/5/19] 更新计算公式
 * REM自适应方案

 我们将pc宽度 screenWidth 分为10等份，其中1等分的值作为html的font-size值，以1920*1080分辨率为基准设置px2rem的rootValue则为192。这种方式有如下2个特点：

 所有长度的比例必然和设计图一致。
 实际的显示长度完全由 html 的 font-size 值决定（线性关系）
 具体如下：

 设：设计稿上有任一1条线: A, A 的长度为 x ，计算 rem 值的基准为z，那么 css 里，A 的长度表示为 x z ( r e m ) rac{x}{z}(rem) zx(rem)
 设： 网页在不同分辨率下运行时html的font-size值为 F s F_s Fs
 那么 A 的实际显示长度就分为: x F s z ( p x ) rac{xF_s}{z}(px) zxFs(px)
 对于任意一条线，其x, z是固定的值，因而其长度根据页面运行时网页html的font-size大小而线性变化，
 如在1920的设计宽度下，长100px的线，设计算rem的基准值是192（宽除以10），那么在1366分辨率下html的root-size为136.6, 则100px的线实际长度为100*136.6 / 192 (px)
 1.2 进一步：
 1. 取计算rem值的基准是设计稿宽度的 1/q，假设设计稿宽度为ax, 高度为ay, 则计算rem的基准值z为 a x q rac{ax}{q} qax
 2. 按上面公式可以得出浏览器中画布实际的宽，高分别为：
 宽 度 ： a x F s a x q = F s q 宽度： rac{axF_s}{ rac{ax}{q}} = F_sq 宽度：qaxaxFs=Fsq
 高 度 ： a y F s a x q = q y F s x 高度： rac{ayF_s}{ rac{ax}{q}} = rac{qyF_s}{x} 高度：qaxayFs=xqyFs
 3. 浏览器窗口的宽度 w 要等于画布实际的宽度，即
 w = F s q 由 此 推 导 F s = w q w=F_sq 由此推导 F_s = rac{w}{q} w=Fsq由此推导Fs=qw

 1.3 再进一步： 不同宽高比下如何设置Fs值？

 以常见的在浏览器窗口中举例，浏览器中画布宽度ax与设计稿一致，而高度比设计高度小，这时我们需要将高度调整为浏览器高度，而又严格按照设计稿的宽高比来进行，那么
 设浏览器document高度为h , 设缩小比例为S, 则根据_1.2中2_的公式得出， h = q y F s x S h= rac{qyF_s}{x}S h=xqyFsS即 S = x h q y F s S= rac{xh}{qyF_s} S=qyFsxh
 由_1.3中3_的公式中得出Fs的值，代入以上公式可知
 S = x h y w 即 ： S = 设 计 稿 长 宽 比 实 际 长 宽 比 S = rac{xh}{yw} 即：S= rac{设计稿长宽比}{实际长宽比} S=ywxh即：S=实际长宽比设计稿长宽比
 *综上：假设设计稿为1920*1080其计算rem的基准值为192px (默认取宽度10等分)，浏览器实际窗口为1920 * 937时rem的基准值则为 192*S，即最终html的fontSize值为166.57px

 PxToRem设置
 rootValue: 192, //换算基数， 默认100 ，这样的话把根标签的字体规定为1rem为50px,这样就可以从设计稿上量出多少个px直接在代码中写多上px了。
 unitPrecision: 5, //允许REM单位增长到的十进制数字。
 propWhiteList: [], //默认值是一个空数组，这意味着禁用白名单并启用所有属性。
 propBlackList: [], //黑名单
 exclude: /(node_module)/, //默认false，可以（reg）利用正则表达式排除某些文件夹的方法，例如/(node_module)/ 。如果想把前端UI框架内的px也转换成rem，请把此属性设为默认值
 selectorBlackList: [], //要忽略并保留为px的选择器
 ignoreIdentifier: false, //（boolean/string）忽略单个属性的方法，启用ignoreidentifier后，replace将自动设置为true。
 replace: false, // （布尔值）替换包含REM的规则，而不是添加回退。
 mediaQuery: false, //（布尔值）允许在媒体查询中转换px。
 minPixelValue: 3 //设置要替换的最小像素值(3px会被转rem)。 默认 0
 */

export function resizeScale() {
  // function setHtmlFontSize() {
  //   const designWidth = 1920,
  //     maxWidth = 2 ** 64,
  //     minWidth = 1366,
  //     base = 100;
  //   const html = document.documentElement || document.body;
  //   const limitMax = maxWidth / designWidth;
  //   const limitMin = minWidth / designWidth;
  //   const scale = document.body.offsetWidth / designWidth;
  //
  //   html.style.fontSize =
  //     (
  //       (scale < limitMin ? limitMin : scale > limitMax ? limitMax : scale) *
  //       base
  //     ).toFixed(2) + "px";
  // }
  // setHtmlFontSize();
  const docEle = document.documentElement;
  const screenRatioByDesign = 16 / 9;
  function setHtmlFontSize() {
    const screenRatio = docEle.clientWidth / docEle.clientHeight;
    let fontSize =
      ((screenRatio > screenRatioByDesign ? screenRatioByDesign / screenRatio : 1) *
        docEle.clientWidth) /
      10;
    // 增加192与16的对应关系
    fontSize = (fontSize / 192) * 16;
    docEle.style.fontSize = `${fontSize.toFixed(3)}px`;
  }

  setHtmlFontSize();

  window.addEventListener(
    'pageshow',
    function (e) {
      if (e.persisted) {
        // 浏览器后退的时候重新计算
        setHtmlFontSize();
      }
    },
    false
  );
  window.addEventListener('resize', setHtmlFontSize, { passive: true });
}

export function pxToRem(size: number) {
  return `${size / 16}rem`;
}
