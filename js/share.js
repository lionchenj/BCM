function share(sharedata) {
  var ajax_data = {};
  // ajax_data['url']=window.location.href;
  ajax_data["url"] = "https://dev170.weibanker.cn/chenjj/www/sina/index.html";
  $.ajax({
    url: "php/jssdk.php",
    type: "POST",
    dataType: "json",
    data: ajax_data,
    timeout: 30000,
    success: function(res) {
      console.log(res);
      wx.config({
        appId: res.appId,
        timestamp: res.timestamp,
        nonceStr: res.nonceStr,
        signature: res.signature,
        jsApiList: [
          // 所有要调用的 API 都要加到这个列表中
          "checkJsApi",
          "onMenuShareTimeline",
          "onMenuShareAppMessage",
          "onMenuShareQQ",
          "onMenuShareWeibo",
          "hideMenuItems",
          "showMenuItems",
          "hideAllNonBaseMenuItem",
          "showAllNonBaseMenuItem",
          "translateVoice",
          "startRecord",
          "stopRecord",
          "onRecordEnd",
          "playVoice",
          "pauseVoice",
          "stopVoice",
          "uploadVoice",
          "downloadVoice",
          "chooseImage",
          "previewImage",
          "uploadImage",
          "downloadImage",
          "getNetworkType",
          "openLocation",
          "getLocation",
          "hideOptionMenu",
          "showOptionMenu",
          "closeWindow",
          "scanQRCode",
          "chooseWXPay",
          "openProductSpecificView",
          "addCard",
          "chooseCard",
          "openCard"
        ]
      });
      wx.ready(function() {
		var START,END,recordTimer;
        //点击录音
        $("#talk_luyin").on("touchstart", function(event) {
          $(".talk_btn").attr("src", "./images/clicklongon.png");
          event.preventDefault();
          START = new Date().getTime();
          recordTimer = setTimeout(function() {
            wx.startRecord({
              success: function() {
                localStorage.rainAllowRecord = "true";
              },
              cancel: function() {
                alert("用户拒绝授权录音");
              }
            });
          }, 300);
        });
        //松手结束录音
        $("#talk_luyin").on("touchend", function(event) {
          $(".talk_btn").attr("src", "./images/clicklong.png");
          event.preventDefault();
          END = new Date().getTime();
          if (END - START < 300) {
            END = 0;
            START = 0;
            //小于300ms，不录音
            clearTimeout(recordTimer);
          } else {
            wx.stopRecord({
              success: function(res) {
				console.log(res)
                voice.localId = res.localId;
                uploadVoice();
              },
              fail: function(res) {
                alert(JSON.stringify(res));
              }
            });
          }
        });
        //上传录音
        function uploadVoice() {
          //调用微信的上传录音接口把本地录音先上传到微信的服务器
          //不过，微信只保留3天，而我们需要长期保存，我们需要把资源从微信服务器下载到自己的服务器
          wx.uploadVoice({
            localId: voice.localId, // 需要上传的音频的本地ID，由stopRecord接口获得
            isShowProgressTips: 1, // 默认为1，显示进度提示
            success: function(res) {
              //把录音在微信服务器上的id（res.serverId）发送到自己的服务器供下载。
              $.ajax({
                url: "后端处理上传录音的接口",
                type: "post",
                data: JSON.stringify(res),
                dataType: "json",
                success: function(data) {
                  alert("文件已经保存到七牛的服务器"); //这回，我使用七牛存储
                },
                error: function(xhr, errorType, error) {
                  console.log(error);
                }
              });
            }
          });
        }
        //注册微信播放录音结束事件
        wx.onVoicePlayEnd({
          success: function(res) {
            stopWave();
          }
        });
		$(".end_share").on("click", () => {
			var shareData = {};
			shareData["title"] = "“成”攻薅羊毛";
			var score = window.localStorage.getItem("score");
			alert(score);
			shareData["desc"] = "“成”攻薅羊毛";
			shareData["imgUrl"] = "../images/first.png";
			shareData["success"] = function(res) {
			  shareSuccess(res);
			};
			shareData["cancel"] = function(res) {
			  shareFail(res);
			};
	
			wx.onMenuShareAppMessage(shareData);
			wx.onMenuShareTimeline(shareData);
			wx.onMenuShareQQ(shareData);
			wx.onMenuShareWeibo(shareData);
			wx.onMenuShareQZone(shareData);
		});
      });
    },
    error: function() {}
  });
}
