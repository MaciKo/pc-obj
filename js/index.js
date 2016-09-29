$(function(){
	var goodsDetail = {
		init: function(){
			this.numInput = $('.amount-option .num-input');
  
			this.styleSelect();
			this.numAdd();
			this.numReduce();
			this.input();
			this.addCart();
		},
		//商品款式选择
		styleSelect: function(){
			$('.goods-style .g-s-item').click(function(){
				$(this).addClass('selected')
					.siblings().removeClass('selected');
			});
		},
		//增加商品数量
		numAdd: function(){
			var that = this;
			$('.amount-option .num-add').click(function(){
				//让num-input的值+1
				var amount = parseInt( that.numInput.val() );//获取到的是一个字符串
				
				//判断库存
				if(amount >= 999){
					return;
				}
				amount++;
				that.numInput.val(amount);
			});
		},
		//减少商品数量
		numReduce: function(){
			var that = this;
			$('.amount-option .num-reduce').click(function(){
				//让num-input的值-1
				var amount = parseInt( that.numInput.val() );//获取到的是一个字符串
				
				//判断下边界
				if(amount <= 1){
					return;
				}
				amount--;
				that.numInput.val(amount);
			});
		},
		//直接输入
		input: function(){
			//实时监控文本的值是否发生变化
			this.numInput.on('input propertychange',function(){
				var amount = $(this).val();
				//判断是否超过边界
				if(amount <= 0){
					amount = 1;
				}else if(amount > 999){
					amount = 999;
				}
				//判断输入是否含有非数字字符
				var reg = /^\d+$/;
				if(!reg.test(amount)){
					amount = 1;
				}

				$(this).val(amount);
			});
		},
		//加入购物车
		addCart: function(){
			$('.goods-buy .add-cart').click(function(){
				//购物车的数据怎么存储？ cookie
				/*
					cart => {}  存储在cookie中发的购物车数据
					{
						'10001':{
							goods-id: 10001,
							goods-amount: 15
						}
					}
				*/
				//读取cookie
				var cart = $.cookie('mls-cart') || '{}';
				cart = JSON.parse(cart);

				var goodsId = $('.goods-style .g-s-item.selected').data('gid');
				var amount = $('.amount-option .num-input').val();

				//判断cart中是否已经存在当前商品
				if(!cart[goodsId]){
					cart[goodsId] = {
						goodsId: goodsId,
						goodsAmount: parseInt( amount )
					};
				}else{
					cart[goodsId].goodsAmount += parseInt(amount);
				}

				//写到cookie中
				$.cookie('mls-cart',JSON.stringify( cart ),{expires: 365,path:'/'});
				console.log(JSON.parse( $.cookie('mls-cart') ) );
				alert('添加成功');

				/*var dog = {};
				if(!dog['name']){
					dog['name'] = '哈士奇';
				}*/
			});
		}
	};
	goodsDetail.init();
});