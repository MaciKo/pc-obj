$(function(){
	var cart = {
		init: function(){
			this.selectAllBtn = $('.cart-option .select-all-btn,.cart-main-title input[type="checkbox"]');

			this.cart = null;
			//定义结算购物车
			this.payCart = {};

			this.initGoods();
			this.numAdd();
			this.numReduce();
			this.input();
			this.delete();
			this.checkboxChange();
			this.deleteSelected();
			this.selectAll();
		},
		//初始化购物车数据
		initGoods: function(){
			var that = this;
			$.getJSON('js/data.json',function(result){
				//console.log(result);
				that.getCookie();
				//var goods = {};
				for(var key in that.cart){
					//key 某个商品id

					(function(key){
						//生成一条数据
						var goods = $('<div class="goods-item"></div>');
						//console.log(goods[key]);
						goods.load('goodsInfo.html',function(){
							console.log(key);
							goods.find('.cart-goods-item').attr('data-id',result[key]['goods-id']);
							goods.find('.goods-name a').html(result[key]['goods-name']);
							goods.find('.goods-price').html(result[key]['goods-price']);
							goods.find('.goods-style').html(result[key]['goods-style']);
							goods.find('.goods-size').html(result[key]['goods-size']);
							goods.find('.goods-img img').attr('src',result[key]['goods-img']);
							goods.find('.td-amount-wrapper .amount-input')
								.attr('data-stock',result[key]['goods-stock'])
								.val(that.cart[key].goodsAmount);

							var money = that.cart[key].goodsAmount * result[key]['goods-price'];
							goods.find('.goods-money').html( money.toFixed(2) );

							$('.cart-main-content').append(goods);
						});
					})(key);
				}
			});
		},
		//增加商品数量
		numAdd: function(){
			var that = this;
			$('.cart-main-content').on('click','.amount-increase',function(){
				//alert(1);
				var amount = parseInt( $(this).prev().val() );
				var stock = $(this).prev().data('stock');
				if(amount >= stock){
					return;
				}
				amount++;
				$(this).prev().val(amount);

				//调用小计处理方法
				that.moneyHandle($(this),amount);
			});
		},
		moneyHandle: function(obj,amount){
			//获取操作商品的id
			var goodsId = obj.parents('.cart-goods-item').data('id');
			//修改cart中的数据
			this.cart[goodsId].goodsAmount = amount; 
			//写入到cookie中
			this.setCookie();

			//处理小计
			var price = obj.parents('.td-gamount').prev().find('.goods-price').html();
			var money = amount * price;
			obj.parents('.td-gamount').next().find('.goods-money').html(money.toFixed(2));
		},
		//减少商品数量
		numReduce: function(){
			var that = this;
			$('.cart-main-content').on('click','.amount-decrease',function(){
				//alert(1);
				console.log(that.cart);
				var amount = parseInt( $(this).next().val() );
				if(amount <= 1){
					return;
				}
				amount--;
				$(this).next().val(amount);

				//调用小计处理方法
				that.moneyHandle($(this),amount);
			});
		},
		input: function(){
			var that = this;
			$('.cart-main-content').on('input propertychange','.amount-input',function(){
				//alert(1);

				var amount = parseInt( $(this).val() );
				var stock = $(this).data('stock');
				
				if(amount <= 0){
					amount = 1;
				}else if(amount >= stock){
					amount = stock;
				}
				
				//非法字符处理
				var reg = /^\d+$/;
				if(!reg.test(amount)){
					amount = 1;
				}

				$(this).val(amount);

				//调用小计处理方法
				that.moneyHandle($(this),amount);

			});
		},
		//点击删除（每一行）
		delete: function(){
			var that = this;
			$('.cart-main-content').on('click','.td-option a',function(){
				var goodsId = $(this).parents('.cart-goods-item').data('id');
				//alert(1);
				if(confirm('确定删除宝贝吗？')){
					//怎么删除对象的属性？
					delete that.cart[goodsId];

					$(this).parents('.cart-goods-item').parent().remove();

					//写入到cookie中
					that.setCookie();
				}
			});
		},
		//复选框点击事件
		checkboxChange: function(){
			var that = this;
			$('.cart-main-content').on('change','.td-checkbox input',function(){
				//alert(1);
				//获取点击的商品的id
				var id = $(this).parents('.cart-goods-item').data('id');
				//如果被选中，保存到payCart中
				if($(this).prop('checked')){
					var obj = {
						id: id,
						amount: $(this).parents('.cart-goods-item').find('.amount-input').val(),
						price: $(this).parents('.cart-goods-item').find('.goods-price').html()
					};
					that.payCart[id] = obj;
				}else{
					delete that.payCart[id];
				}
				//console.log(that.payCart);

				//处理选取商品件数和总价
				var count = 0;
				var totalMoney = 0;
				for(var key in that.payCart){
					count++;
					totalMoney += that.payCart[key].amount * that.payCart[key].price
				}
				$('.user-goods-amount').html(count);
				$('.user-goods-money').html(totalMoney.toFixed(2));
				//console.log(count,totalMoney);

				//处理结算按钮状态
				if(count > 0){
					$('.cart-info .go-pay').addClass('can-pay');
				}else{
					$('.cart-info .go-pay').removeClass('can-pay');
				}
			});
		},
		//全选
		selectAll: function(){
			this.selectAllBtn.click(function(){
				//改变goods-item中input的状态
				if($(this).prop('checked')){
					$('.goods-item input[type="checkbox"]').prop('checked',true);
				}else{
					$('.goods-item input[type="checkbox"]').prop('checked',false);
				}
				//触发input的change事件
				$('.goods-item input[type="checkbox"]').change();
			});
		},
		//删除选中的商品
		deleteSelected: function(){
			/*
				遍历所有的goods-item 
				$('.goods-item').each(function(k,v){})
				k: 当前元素的下标
				v：当前原生元素节点
			*/
			var that = this;
			$('.cart-option .delete a').click(function(){
				$('.cart-main-content .goods-item').each(function(k,v){
					if($(this).find('input[type="checkbox"]').prop('checked')){
						//从页面上删除
						$(this).remove();
						//从cookie中删除
						var id = $(this).find('.cart-goods-item').data('id');
						delete that.cart[id];
						that.setCookie();
					}
				});
			});
		},
		//读取cookie
		getCookie: function(){
			//读取mls-cartcookie，并做兼容
			this.cart = $.cookie('mls-cart') || '{}';
			//将json字符串转化为json对象
			this.cart = JSON.parse( this.cart );
		},

		//设置cookie
		setCookie: function(){
			$.cookie('mls-cart',JSON.stringify(this.cart),{expires: 365,path:'/'});
		}
	}
	cart.init();
});
