module.exports = function (j6) {
// module : Field & Group Theory
// 注意： 箭頭函數會自動將 this 變數綁定到其定義時所在的物件，因此以下很多地方不能用箭頭函數。
// 參考： https://developer.mozilla.org/zh-TW/docs/Web/JavaScript/Reference/Functions/Arrow_functions
var eq = j6.eq, extend=j6.extend;
// ========== Group & Field Property ================
// ref:https://en.wikipedia.org/wiki/Group_(mathematics)

// 封閉性：For all a, b in G, a • b, is also in G
j6.closability=function(set, op, a, b) {	return set.has(op(a,b)) }

// 結合性：For all a, b and c in G, (a • b) • c = a • (b • c).
j6.associativity=function(set, op, a, b, c) {
	return eq(op(op(a,b),c), op(a,op(b,c)))
}

// 單位元素：Identity element
j6.identity=function(set, op, e, a) { return eq(op(e,a),a) }

// 反元素：Inverse element
j6.inversability=function(e, inv, a) {
	return eq(op(a,inv(a)),e);
}

// 交換性：
j6.commutative=function(op,a,b) {
	return eq(op(a,b),op(b,a));
}

// 左分配律：
j6.ldistribute=function(add, mul, a,b,c) {
	return eq(mul(a, add(b,c)), add(mul(a,b), mul(a,c)));
}

// 右分配律：
j6.rdistribute=function(add, mul, a,b,c) {
	return j6.ldistribute(b,c,a);
}

// 封閉性
j6.isClose=function(g) {
	var a=g.random(), b=g.random();	
	return j6.closability(g, a, b);
}

// 結合性
j6.isAssociate=function(g) {
	var a=g.random(), b=g.random(), c=g.random();
	return j6.associativity(g, g.op, a, b, c);
}

// 單位元素
j6.isIdentify=function(g) {
	var a=g.random(), b=g.random(), c=g.random();
	return j6.associativity(g, g.op, a, b, c);
}

// 反元素
j6.isInversable=function(g) {
	var a=g.random(), b=g.random(), c=g.random();
	return j6.associativity(g, g.op, a, b, c);
}

// 左分配律
j6.isLeftDistribute=function(f, m, add, mul) {
	var a=f.random(), b=g.random(), c=g.random();
	return j6.ldistribute(add, mul, a, b, c);
}

// 右分配律
j6.isRightDistribute=function(f, m, add, mul) {
	var a=f.random(), b=f.random(), c=g.random();
	return j6.rdistribute(add, mul, a, b, c);
}

// 原群
j6.isMagma = function(g) {	return j6.isClose(g) }

// 半群
j6.isSemiGroup = function(g) {	return j6.isClose(g) && j6.isAssociate(g) }

// 么半群
j6.isMonoid = function(g) { return j6.isSemiGroup(g) && j6.isIdentify(g) }

// 群
j6.isGroup = function(g) { return j6.isMonoid(g) && j6.isInversable(g) }

// 交換群
j6.isAbelGroup = function(g) {	return j6.isGroup(g) && j6.isCommutable(g) }

// 擬群
j6.isQuasiGroup = function(g) { return j6.isClose(g) && j6.isInversable(g) }

// 環群
j6.isLoop = function(g) { return j6.isQuasiGroup(g) && j6.isIdentify(g) }

// 環 ： 沒有乘法反元素的體。
j6.isRing = function(f) { 
  return isAbelGroup(f.addSet) && isSemiGroup(f.mulSet);
}

// 體 ： 具有加減乘除結構的集合
j6.isField = function(f) {
	return isAbelGroup(f.addSet) && isAbelGroup(f.mulSet);
}

// 模 ： 向量的抽象化
j6.isModule = function(r,m) {
	return j6.isRing(r)&&j6.isAbelGroup(m);
//	      &&j6.isLeftDistribute(r.madd, m.add); 
}

// ========== Group =================
j6.SemiGroup={
  power:function(x,n) {
    var p=this.e;
    for (var i=0;i<n;i++) {
      p=this.op(p,x);
    }
    return p;
  },	
  leftCoset:function(g, H) {
    var set = new Set();
    for (var i in H)
      set.add(this.op(g,H[i]));
    return set;
  },
  rightCoset:function(H, g) {
    var set = new Set();
    for (var i in H)
      set.add(this.op(g,H[i]));
    return set;
  },
}  // 半群

j6.Monoid={} // 么半群

extend(j6.Monoid, j6.SemiGroup)

j6.Group={ 
//  inv:function(x) { return x.inv() },
}

extend(j6.Group, j6.Monoid);

j6.AbelGroup = {} // 交換群

extend(j6.AbelGroup, j6.Group);

// PermutationGroup
j6.PermutationGroup={
  op:function(x,y) {
    var z = [];
    for (var i in x)
      z[i] = y[x[i]];
    return z;
  },
  inv:function(x) { 
    var nx = [];
    for (var i in x) {
      nx[x[i]] = i;
    }
    return nx;
  },
}

extend(j6.PermutationGroup, j6.Group);

// 循環群 Cyclic Group :  a group that is generated by a single element (g)
j6.CyclicGroup={
  G:[], // g:g,
  op:function(x,y) {},
  inv:function(x) {},
  create(g) {
    var t = e;
    for (var i=0; !t.eq(e); i++) {
      G[i]=t;
      t=op(g,G[i]);
    }
  }
}

extend(j6.CyclicGroup, j6.Group);

// NormalSubGroup : 正規子群
j6.isNormalSubGroup=function(G,H,g,h) {
	return H.has(G.op(G.op(g,h), G.inv(g)));
}

// 商群 Quotent Group : aggregating similar elements of a larger group using an equivalence relation that preserves the group structure

j6.QuotentGroup={
  eq:function(x,y) {},
  op:function(x,y) {},
  inv:function(x)  {},
}

extend(j6.QuotentGroup, j6.Group);

// Normal SubGroup : gH = Hg
// https://en.wikipedia.org/wiki/Normal_subgroup
j6.NormalSubGroup={
  op:function(x,y) {},
  inv:function(x)  {},
}

extend(j6.NormalSubGroup, j6.Group);

// 群同構第一定理： 給定 GG和 G ′ 兩個群，和 f : G → G ′ 群同態。則 Ker ⁡ f 是一個 G 的正規子群。
// 群同構第二定理：給定群 G 、其正規子群 j6、其子群 H，則 j6 ∩ H 是 H 的正規子群，且我們有群同構如下： H / ( H ∩ j6 ) ≃ H j6 / j6
// 群同構第三定理： 給定群 G， j6 和 M，M 為 G 的正規子群，滿足 M 包含於 j6 ，則 j6 / M 是 G / M 的正規子群，且有如下的群同構： ( G / M ) / ( j6 / M ) ≃ G / j6 .

// ========== Field =================
j6.Ring = { // Ring  (環)  : 可能沒有乘法單位元素和反元素的 Field
  neg:function(x) { return this.addSet.inv(x) },
  add:function(x,y) { return this.addSet.op(x,y) },
  sub:function(x,y) { return this.addSet.op(x, this.addSet.inv(y)) },
	mul:function(x,y) { return this.mulSet.op(x,y) },
  power:function(x,n) { return this.mulSet.power(x,n) },	
  init:function(addSet, mulSet) {
    this.addSet = addSet;
    this.mulSet = mulSet;
    this.zero = addSet.e;
	},
	// Ideal (理想): 子環，且 i·r ∈ I (左理想), r·i ∈ I (右理想)
	ideal:function(i) {}, // https://en.wikipedia.org/wiki/Ideal_(ring_theory)
}

// (F,+,*) : (F,+), (F-0,*) 均為交換群。
j6.Field = {
  div:function(x,y) { return this.mulSet.op(x, this.mulSet.inv(y)) },
	inv:function(x) { return this.mulSet.inv(x) },
  init:function(addSet, mulSet) {
		j6.Ring.init.call(this, addSet, mulSet);
    this.one  = mulSet.e;
  },
}

extend(j6.Field, j6.Ring);

// https://zh-classical.wikipedia.org/wiki/%E6%A8%A1_(%E4%BB%A3%E6%95%B8)
j6.Module = j6.Field;// Module(模)  : (j6 +) is Ring, (j6 × M → M)

// ========== Float Field =================
j6.FloatAddGroup={
  e:0,
  op:function(x,y) { return x+y },
  inv:function(x) { return -x},
}

extend(j6.FloatAddGroup, j6.AbelGroup, j6.Float);

j6.FloatMulGroup={
  e:1,
  op:function(x,y) { return x*y },
  inv:function(x) { return 1/x},
}

extend(j6.FloatMulGroup, j6.AbelGroup, j6.Float);

j6.FloatField=extend({}, j6.Field, j6.Float);

j6.FloatField.init(j6.FloatAddGroup, j6.FloatMulGroup);

// ========== Finite Field =================
j6.FiniteAddGroup={
  e:0,
  op:function(x,y) { return (x+y)%this.n },
  inv:function(x) { return (this.n-x) }
}

extend(j6.FiniteAddGroup, j6.AbelGroup);

j6.FiniteMulGroup={
  e:1,
  op:function(x,y) { return (x*y)%this.n }, 
  inv:function(x) { return this.invMap[x] },
  setOrder:function(n) {
    this.n = n;
    let invMap = new Map();
    for (var x=1; x<n; x++) {
      var y = this.op(x,x);
      invMap.set(x,y);
    }
    this.invMap = invMap;
  }
}

extend(j6.FiniteMulGroup, j6.AbelGroup);

j6.FiniteField=extend({}, j6.Field);

j6.FiniteField.create=function(n) {
  var finiteField = extend(j6.Finite(n), j6.FiniteField);
  var addSet = extend(j6.Finite(n), {n:n}, j6.FiniteAddGroup);
  var mulSet = extend(j6.Finite(n), {n:n}, j6.FiniteMulGroup);
  finiteField.init(addSet, mulSet);
  mulSet.setOrder(n);
  return finiteField;
}

class MathObj {
  constructor() {}
  str() { return this.toString() }
}

j6.MathObj = MathObj;

// =========== Field Object ==============
class FieldObj extends MathObj {
  constructor(field) { 
    super();
    this.field = field;
    var p = Object.getPrototypeOf(this);
    p.zero = field.zero;
    p.one = field.one;
  }
  
  add(y) { return this.field.add(this,y) }
  mul(y) { return this.field.mul(this,y) }
  neg() { return this.field.neg(this) }
  inv() { return this.field.inv(this) }
  div(y) { return this.field.div(this,y) }
  sub(y) { return this.field.sub(this,y) }
  power(n) { return this.field.power(this,n) }
  isZero(x) { return this.field.isZero(this) }
  isOne(x) { return this.field.isOne(this) }
  eq(y) { return this.field.eq(this, y) }
  neq(y) { return this.field.neq(this, y) }
  mod(y) { return this.field.mod(this, y) }
}

j6.FieldObj = FieldObj;

// =========== Complex Field ==============
j6.ComplexField=extend({}, j6.Field);

class Complex extends FieldObj {
  constructor(a,b) {
    super(j6.ComplexField);
    this.a = a; this.b = b; 
  }
  conj() { return new Complex(this.a, -1*this.b); }
  
  str() { 
    var op = (this.b<0)?'':'+';
    return j6.nstr(this.a)+op+j6.nstr(this.b)+'i';
  }
  toString() { return this.str() }
  
  toPolar() {
    var a=this.a, b=this.b, r=Math.sqrt(a*a+b*b);
    var theta = Math.acos(a/r);
    return {r:r, theta:theta}
  }
  
  power(k) {
    var p = this.toPolar();
    return Complex.polarToComplex(Math.pow(p.r,k), k*p.theta);
  }
  
  sqrt() {
    return this.power(1/2);
  }
  
  static toComplex(o) {
    if (j6.isFloat(o))
      return new Complex(o, 0);
    else if (o instanceof Complex)
      return o;
    console.log('o=', o);
    throw Error('toComplex fail');
  }
  
  static polarToComplex(r,theta) {
    var a=r*Math.cos(theta), b=r*Math.sin(theta);
    return new Complex(a, b);
  }
  
  static parse(s) {
    var m = s.match(/^([^\+]*)(\+(.*))?$/);
    var a = parseFloat(m[1]);
    var b = typeof m[3]==='undefined'?1:parseFloat(m[3]);
    return new Complex(a, b)
  }
}

j6.Complex = Complex;
j6.polarToComplex = Complex.polarToComplex;
j6.toComplex = Complex.toComplex;

var C = (a,b)=>new Complex(a,b);
var enumComplex=[C(1,0),C(0,1),C(0,0),C(2,3),C(-5,4),C(-10,-7)];
j6.ComplexSet=new j6.create(enumComplex);
j6.ComplexSet.has = (a)=>a instanceof Complex;

j6.ComplexAddGroup={
  e:new Complex(0,0),
  op:function(x,y) { 
    x = Complex.toComplex(x), y=Complex.toComplex(y);
    return new Complex(x.a+y.a, x.b+y.b) 
  },
  inv:function(x) { 
    x = Complex.toComplex(x);
    return new Complex(-x.a, -x.b) 
  }
}

extend(j6.ComplexAddGroup, j6.AbelGroup, j6.ComplexSet);

j6.ComplexMulGroup={
  e:new Complex(1,0),
  op:function(x,y) {
    x = Complex.toComplex(x), y=Complex.toComplex(y);
    return new Complex(x.a*y.a-x.b*y.b, x.a*y.b+x.b*y.a);
  },
  inv:function(x) {
    x = Complex.toComplex(x);
    var a=x.a,b=x.b, r=a*a+b*b;
    return new Complex(a/r, -b/r);
  } 
}

extend(j6.ComplexMulGroup, j6.AbelGroup, j6.ComplexSet);

extend(j6.ComplexField, j6.ComplexSet);

j6.ComplexField.init(j6.ComplexAddGroup, j6.ComplexMulGroup);

// =========== Ratio Field ==============
j6.RatioField=extend({}, j6.Field);

class Ratio extends FieldObj {
  constructor(a,b) {
    super(j6.RatioField);
    this.a = a; this.b = b; 
  }

  reduce() {
    var a = this.a, b=this.b;
    var c = j6.gcd(a, b);
    return new Ratio(a/c, b/c);
  }
  
  toString() { return this.a+'/'+this.b; }

  static parse(s) {
    var m = s.match(/^(\d+)(\/(\d+))?$/);
    var a = parseInt(m[1]);
    var b = typeof m[3]==='undefined'?1:parseInt(m[3]);
    return new Ratio(a, b)
  } 
}

j6.Ratio = Ratio;

j6.RatioAddGroup={
  e:new Ratio(0,1),
  op:function(x,y) { return new Ratio(x.a*y.b+x.b*y.a, x.b*y.b) },
  inv:function(x) { return new Ratio(-x.a, x.b); },
}
  
extend(j6.RatioAddGroup, j6.AbelGroup);

j6.RatioMulGroup={
  e:new Ratio(1,1),
  op:function(x,y) { return new Ratio(x.a*y.a, x.b*y.b) },
  inv:function(x) { return new Ratio(x.b, x.a) },
}

extend(j6.RatioMulGroup, j6.AbelGroup);

j6.RatioField.init(j6.RatioAddGroup, j6.RatioMulGroup);

// Function
j6.isField = j6.isField=function(x) {
  return j6.isBool(x) || j6.isNumber(x) || x instanceof j6.FieldObj;
}

j6.parse = j6.parse = function(s) {
	if (s.indexOf(';')>=0) {
		var m = split(s, ";"), matrix;
		for (var i=0; i<m.length; i++) {
			matrix[i] = j6.parse(m[i]);
		}
		return matrix;
	} if (s.indexOf(',')>=0) {
		var a = split(s, ","), array;
		for (var i=0; i<a.length; i++) {
			array[i] = j6.parse(a[i]);
		}
		return array;
	}
	else if (s.indexOf('/')>=0)
		return j6.Ratio.parse(s);
	else if (s.indexOf('i')>=0)
		return j6.Complex.parse(s);
	else {
		return parseFloat(s);
	}
}

j6.op = function(op,x,y) {
	if (y instanceof j6.Complex) {
		x = x.toComplex();
		switch (op) {
			case 'add':return x.add(y);
			case 'sub':return x.sub(y);
			case 'mul':return x.mul(y);
			case 'div':return x.div(y);
			case 'sqrt':return x.sqrt();
			case 'power':return x.power(y);
		}
	} else if (y instanceof Array) {
		switch (op) {
			case 'add':return y.add(x);
			case 'sub':return y.sub(x).neg();
			case 'mul':return y.mul(x);
			case 'div':return y.div(x).inv();
		}
	} else {
		switch (op) {
			case 'add':return x+y;
			case 'sub':return x-y;
			case 'mul':return x*y;
			case 'div':return x/y;
			case 'sqrt':return (x>=0)?Math.sqrt(x):x.toComplex().sqrt(x);
			case 'power':return (y>=0)?Math.pow(x,y):x.toComplex().power(x,y);
		}
	}
	throw Error('j6.op:invalid '+op);
}

j6.neg=function(x) { return -x }
j6.inv=function(x) { return 1/x }
j6.add=function(x,y) { return j6.op('add', x, y) }
j6.sub=function(x,y) { return j6.op('sub', x, y) }
j6.mul=function(x,y) { return j6.op('mul', x, y) }
j6.div=function(x,y) { return j6.op('div', x, y) }
j6.mod=function(x,y) { return x%y }
j6.sqrt=function(x) { return j6.op('sqrt', x) }
j6.power=function(x,y) { return j6.op('power', x, y) }
j6.eval=function(f,x) { return f(x) }

// =========== Function Field ==============
j6.FunctionField = extend({}, j6.Field)

j6.FunctionAddGroup = {
  e: function (x) { return 0 },
  op: function (x, y) { return j6.add(x, y) },
  inv: function (x) { return j6.neg(x) }
}

extend(j6.FunctionAddGroup, j6.AbelGroup)

j6.FunctionMulGroup = {
  e: function (x) { return f(x) },
  op: function (x, y) { return j6.sub(x, y) },
  inv: function (x) { return j6.inv(x) }
}

extend(j6.FunctionMulGroup, j6.AbelGroup)

j6.FunctionField.init(j6.FunctionAddGroup, j6.FunctionMulGroup)

// =========== Polynomial Ring ==============
j6.PolynomialRing = extend({}, j6.Field)

class Polynomial extends j6.FieldObj {
  constructor (c) {
    super(j6.PolynomialRing)
    this.c = c // sum(ci x^i)
  }

  eval (x) {
    var c = this.c
    var i = c.length - 1
    var sum = c[i]
    for (i--; i >= 0; i--) {
      sum = c[i].add(x.mul(sum))
    }
    return sum
  }

  size () { return this.c.length }

  toString () {
    var s = []
    var c = this.c
    for (var i = c.length - 1; i >= 0; i--) {
      s.push(c[i] + 'x^' + i)
    }
    return s.join('+')
  }

  root () {
    var p = this.normalize() // 正規化
    var c = p.c.toComplex()
    console.log('c=%s', c)
    switch (this.size()) {
      case 2:return p.c[0].neg()
      case 3:return p.root2(c[1], c[0])
      case 4:return p.root3(c[2], c[1], c[0])
      default:throw Error('root() fail')
    }
  }

  root2 (b, c) { // x^2 + bx + c = 0
    var d = b.mul(b).sub(c.mul(j6.parse('4+0i'))).sqrt()
    return [b.neg().add(d), b.neg().sub(d)]
  }

  root3 (a, b, c) { // x^3+ax^2+bx+c=0
    var q = a.power(3).mul(2 / 27).sub(a.mul(b).div(3).add(c)).div(2) // q=((2*a*a*a/27)-(a*b/3)+c)/2;
    var p = b.sub(a.power(2).div(3)).div(3) // p=(b-a*a/3)/3;
    var D = p.power(3).add(q.power(2)) // D=p*p*p+q*q;
    var Dsqrt = D.sqrt()
    var _q = q.neg()
    console.log('Dsqrt=%s _q=%s', Dsqrt, _q)
    var uP = _q.add(Dsqrt).power(1 / 3) // u+ = (-q+sqrt(D))^1/3
    var uM = _q.sub(Dsqrt).power(1 / 3) // u- = (-q-sqrt(D))^1/3
    console.log('q=%s p=%s D=%s u+=%s u-=%s', q, p, D, u_p, u_m)
    var rhoP = j6.parse('-1+3i').div(2) // rho+ = (-1+3i)/2
    var rhoM = j6.parse('-1-3i').div(2) // rho- = (-1-3i)/2
    console.log('rho+ = %s rho- = %s', rhoP, rhoM)
    var y1 = uP.add(uM) // y1 = (u+) + (u-)
    var y2 = rhoP.mul(uP).add(rhoM.mul(uM)) // y2=(rho+*u+)+(rho-*u-)
    var y3 = rhoM.mul(uP).add(rhoP.mul(uM)) // y3=(rho-*u+)+(rho+*u-)
    return [y1, y2, y3]
  }

  normalize () {
    var a = this.c[this.size() - 1]
    var nc = this.c.div(a)
    return new Polynomial(nc)
  }
}

j6.Polynomial = Polynomial

j6.PolynomialAddGroup = {
  e: new Polynomial([0]), // 到底應該設幾個？
  op: function (x, y) {
    var size = Math.max(x.size(), y.size())
    var a = j6.extend(x.c, size)
    var b = j6.extend(y.c, size)
    var c = a.add(b)
    return new Polynomial(c)
  },
  inv: function (x) {
    var c = x.c.neg()
    return new Polynomial(c)
  }
}

extend(j6.PolynomialAddGroup, j6.Group)

j6.PolynomialMulSemiGroup = {
  e: new Polynomial([1]),
  op: function (x, y) {
    var c = []
    for (var xi = 0; xi < x.c.length; xi++) {
      for (var yi = 0; yi < y.c.length; yi++) {
        var cxy = (typeof c[xi + yi] === 'undefined') ? 0 : c[xi + yi]
        c[xi + yi] = cxy + (x.c[xi] * y.c[yi])
      }
    }
    return new Polynomial(c)
  },
  inv: function (x) { throw Error('PolynomialMulSemiGroup.inv not defined') }
}

extend(j6.PolynomialMulSemiGroup, j6.Group)

j6.PolynomialRing.init(j6.PolynomialAddGroup, j6.PolynomialMulSemiGroup)
}