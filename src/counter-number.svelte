<script>
  export let gender = '';
  export let yearLimit = 0;
  export let sickYear = 0;
  export let bornYear = 0;
  export let bornMonth = 0;

  import { afterUpdate, onMount } from "svelte";

  let gapTime = '';
  let gapWeek = '';
  let gapMonth = '';
  let gapSeason = '';
  let gapYear = '';
  let endMonth = '';
  let endYear = '';

  const init = () => {
    let nBornYear = Number(bornYear);
    let nBornMonth = Number(bornMonth);
    let limitYear = Math.floor(yearLimit);
    let oddMonth = Math.floor((yearLimit - limitYear) * 12);
    let totalMonth = nBornMonth + oddMonth;
    let beginTime = new Date();
    let endTime = new Date(endYear, endMonth);

    gapTime = endTime.getTime() - beginTime.getTime();
    gapWeek = Math.floor(gapTime / 1000 / 60 / 60 / 24 / 7);
    gapMonth = Math.floor(gapTime / 1000 / 60 / 60 / 24 / 365 * 12);
    gapSeason = Math.floor(gapTime / 1000 / 60 / 60 / 24 / 365 * 12 / 3);
    gapYear = Math.floor(gapTime / 1000 / 60 / 60 / 24 / 365);
    endMonth = totalMonth > 12 ? totalMonth - 12 : totalMonth;
    endYear = totalMonth > 12 ? limitYear + 1 + nBornYear : limitYear + nBornYear;
  };

  onMount(() => {
    init();
  });

  afterUpdate(() => {
    init();
  });

</script>

<section>
  <div class="item-wrapper">
    <div class="item-desc">中国{gender === 'man' ? '男性':'女性'}平均寿命</div>
    <div class="item-value">{yearLimit} 岁</div>
  </div>
  <div class="item-wrapper">
    <div class="item-desc">平均健康寿命</div>
    <div class="item-value">{yearLimit - sickYear}年</div>
  </div>
  <div class="item-wrapper">
    <div class="item-desc">预计时间</div>
    <div class="item-value">{endYear}年{endMonth}月</div>
  </div>
  <div class="item-wrapper">
    <div class="item-desc">周剩下</div>
    <div class="item-value">{gapWeek}周</div>
  </div>
  <div class="item-wrapper">
    <div class="item-desc">月剩下</div>
    <div class="item-value">{gapMonth}月</div>
  </div>
  <div class="item-wrapper">
    <div class="item-desc">季节剩下</div>
    <div class="item-value">{gapSeason}季节</div>
  </div>
  <div class="item-wrapper">
    <div class="item-desc">年剩下</div>
    <div class="item-value">{gapYear}年</div>
  </div>
</section>

<style>
  section {
    box-sizing: border-box;
    padding-top: 20px;
    height: fit-content;
  }
  .item-wrapper {
    display: block;
    width: 100%;
    box-sizing: border-box;
    padding: 0 10px;
    font-size: 0;
    height: 50px;
    line-height: 50px;
  }
  .item-desc {
    display: inline-block;
    width: 60%;
    font-size: 18px;
    text-align: left;
  }
  .item-value {
    display: inline-block;
    width: 40%;
    font-size: 20px;
    text-align: right;
  }
</style>
