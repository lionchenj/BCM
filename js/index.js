share();
$(".index_first").on("click", () => {
  $(".index_first").hide();
  setTimeout(() => {
    $(".index_start").hide();
    $(".index_talk").hide();
  }, 200);
});

$(".end_clickget").on("click", () => {

});

let data = {
    "accessToken":"6b0cdb2c6c68b445fdd5e7af7d2e4264",
    "input":"今天天气怎么样",
    "city":"广州",
    "position":"广东广州",
    "data":[
            {
            "target":ID,
            "list":[]
            }
        ]
    }
$.ajax({
    url: "http://dev.lingju.ai:8999/httpapi/ljchat.do",
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