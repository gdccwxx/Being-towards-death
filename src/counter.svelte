<script>
  export let yearLimit = 74.8;
  export let sickYear = 8;
  export let bornYear = '1997';
  export let bornMonth = '5';
  export let currYear = '2021';
  export let currMonth = '12'
  const months = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(i => i * 2);
  let years = new Array(Math.ceil(yearLimit / 2))
    .fill('')
    .map((_, index) => index * 2);

  let nCurrYear = Number(currYear);
  let nCurrMonth = Number(currMonth);

  let nBornYear = Number(bornYear);
  let nBornMonth = Number(bornMonth);

  const isPassed = (index) => {
    const passedInteger = (nCurrYear - nBornYear) * 12;
    const passedOdd = nCurrMonth - nBornMonth;
    return passedInteger + passedOdd > index;
  };

  const isSick = (index) => {
    const passedInteger = Math.floor((yearLimit - sickYear) * 12);
    return passedInteger < index;
  };

  let boxs = new Array(Math.ceil(yearLimit * 12))
    .fill('')
    .map((_, index) => {
      console.log('isSick', isSick(index));
      if (isSick(index)) return 'sick';

      if (isPassed(index)) return 'passed';

      return 'feature';
    });

  import { afterUpdate, onMount } from "svelte";

  const init = () => {
    years = new Array(Math.ceil(yearLimit / 2))
    .fill('')
    .map((_, index) => index * 2);

    nCurrYear = Number(currYear);
    nCurrMonth = Number(currMonth);

    nBornYear = Number(bornYear);
    nBornMonth = Number(bornMonth);

    boxs =  new Array(Math.ceil(yearLimit * 12))
      .fill('')
      .map((_, index) => {
        console.log('isSick', isSick(index));
        if (isSick(index)) return 'sick';

        if (isPassed(index)) return 'passed';

        return 'feature';
      });
  };

  afterUpdate(() => init());
  onMount(() => init());

</script>

<section>
  <div class="months">
    {#each months as month}
      <span class="month-item">{month}</span>
    {/each}
  </div>
  <div class="wrapper">
    <div class="year">
      {#each years as year}
        <span class="year-item">{year}</span>
      {/each}
    </div>
    <div class="box-container">
      {#each boxs as box}
        <div class={`box-item ${box}`} />
      {/each}
    </div>
  </div>
</section>

<style>
  section {
    width: 100%;
    height: fit-content;
    box-sizing: border-box;
    padding: 10px;
    overflow-y: scroll;
    overflow-x: hidden;
  }
  .months {
    width: 100%;
    height: 15px;
    padding-left: 15px;
    font-size: 0;
  }
  .month-item {
    font-size: 10px;
    display: inline-block;
    width: 21px;
    padding-right: 1px;
    height: inherit;
    text-align: right;
    line-height: 15px;
  }
  .wrapper {
    width: 100%;
    font-size: 0px;
  }
  .year {
    width: 15px;
    display: inline-block;
    font-size: 0;
    vertical-align: top;
  }
  .year-item {
    font-size: 10px;
    display: inline-block;
    width: 15px;
    height: inherit;
    text-align: center;
    line-height: 10px;
    height: 11px;
  }
  .box-container {
    display: inline-block;
    width: 265px;
    font-size: 0;
    vertical-align: top;
  }
  .box-item {
    width: 10px;
    height: 10px;
    display: inline-block;
    border-right: 1px solid #fff;
    border-bottom: 1px solid #fff;
  }

  .feature { 
    background-color: rgb(235, 51, 23);
  }

  .passed {
    background-color: rgb(41, 104, 153);
  }

  .sick {
    background: rgb(162, 132, 117);
  }
</style>
