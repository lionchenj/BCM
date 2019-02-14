<?php
        //获取地址链接中的code参数
    $code = $_GET['code'];
    //curl 的post请求
    function CurlPost($url, $data)
    {
        $curl = curl_init();
        curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, FALSE);
        curl_setopt($curl, CURLOPT_SSL_VERIFYHOST, FALSE);
        curl_setopt($curl, CURLOPT_SSLVERSION, CURL_SSLVERSION_TLSv1);
        curl_setopt($curl, CURLOPT_URL, $url);
        if(!empty($data))
        {
            curl_setopt($curl, CURLOPT_POST, true);
            curl_setopt($curl, CURLOPT_POSTFIELDS, $data);
        }
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
        $result = curl_exec($curl);
        curl_close($curl);
        return $result;
    }
        //get请求
    function CurlGet($url)
    {
        return CurlPost($url, "");
    }
    //通过code换取网页授权access_token
    $url = "https://api.weixin.qq.com/sns/oauth2/access_token?appid=wx3707459bb86392f8&secret=56301b10a249960f3cee8cd7ed1d7973&code=".$code."&grant_type=authorization_code";
    $rs = json_decode(CurlGet($url));
    //请求成功返回access_token
    if(isset($rs->{'access_token'})){
        //保存access_token
        $access_token = $rs->{'access_token'};
        $openid = $rs->{'openid'};
    //请求成功返回errcode
    }else if (isset($rs->{'errcode'})) {
        //# code...
    }
    //拉取用户信息(需scope为 snsapi_userinfo)
    $user = json_decode(CurlGet("https://api.weixin.qq.com/sns/userinfo?access_token=".$access_token."&openid=".$openid."&lang=zh_CN"));
    echo $user->{'nickname'};
?>