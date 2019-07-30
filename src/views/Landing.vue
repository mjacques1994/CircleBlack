
<template>
  <div class = "landing">

  <div id="background"></div>


<div id = "vue">

  <div id = "circleblackimg"> </div>


    <p> World's leading financial dashboard</p>

   <router-link id="cb-button" :to="'Callback'">Enter</router-link>


</div>
</div>



  </div>
</template>

<script>

</script>

<style>
@import url('https://fonts.googleapis.com/css?family=Ubuntu');

#cb-button{
  font-size: 30px;
}

body {
  margin: 0;
  position: absolute;
  height: 100%;
  width: 100%;
  font-family: ubuntu;
}

#background {
  position: absolute;
  z-index: -1;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: url(https://cdnsite2.assist.ro/sites/all/themes/assist/img/backgrounds/testimonials_bg.png) repeat;
  background-color: #095396;
}

#circleblackimg{
  height: 100px;
  background: url(https://www.circleblack.com/hs-fs/hubfs/CBLogoWhite.png?width=244&name=CBLogoWhite.png) no-repeat;
}
/*Vue*/

#vue {
  margin: auto;
  margin-top: 128px;
  width: 300px;
  height: 326px;
  padding: 54px 36px 112px;
  background-color: #1d1e22;
  text-align: center;

  border-radius: 16px;
  box-shadow: 0 4px 64px black;
}

#vue h1 {
  color: white;
}
#vue p{
  color: gray;
}
#vue p#darkblue {
  margin-top: 42px;
  margin-bottom: 24px;
  text-shadow: 0 0 60px darkblue;
}

#vue #bar {
  margin-top: 38px;
  margin-bottom: 40px;
  height: 1px;
  background-color: black
}

#vue label {
  display: block;
  margin-bottom: 32px;
  font-weight: bold;
  text-align: center
}

#vue input {
  width: 200px;
  padding: 4px;
  border: 2px solid darkblue;
  border-radius: 8px;
}

#vue button {
  cursor: pointer;
}


</style>
