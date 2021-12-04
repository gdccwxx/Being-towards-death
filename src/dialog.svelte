<script>
  export let display = false;
  export let onSetBasicInfos;
  const currentYear = new Date().getFullYear();
  const years = new Array(100)
    .fill('')
    .map((_, index) => currentYear - index)
    .reverse('');

  const months = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10 , 11, 12];

  let selectGender = localStorage.getItem('gender') || 'man';
  let selectYear = localStorage.getItem('bornYear') || '1990';
  let selectMonth = localStorage.getItem('bornMonth') || '6';

  const onConfirm = () => {
    if (!selectGender) return;
    if (!selectYear) return;
    if (!selectMonth) return;

    onSetBasicInfos({ year: selectYear, month: selectMonth, gender: selectGender });
  };

</script>

<div class="display-none dialog-container" class:display={display}>
  <div class="mask"/>
  <div class="dialog">
    <h3>请填写基础信息</h3>
    <div class="wrapper">
      <div class="option-wrapper">
        <div class="label">请选择性别</div>
        <div class="select">
          <select bind:value={selectGender}>
            <option value="man">男</option>
            <option value="woman">女</option>
          </select>
        </div>
      </div>
      <div class="option-wrapper">
        <div class="label">请选择年份</div>
        <div class="select">
          <select bind:value={selectYear}>
            {#each years as year}
              <option value={String(year)}>{year}</option>
            {/each}
          </select>
        </div>
      </div>
      <div class="option-wrapper">
        <div class="label">请选择月份</div>
        <div class="select">
          <select bind:value={selectMonth}>
            {#each months as month}
              <option value={String(month)}>{month}</option>
            {/each}
          </select>
        </div>
      </div>
    </div>
    <div class="button-normal primary" on:click="{() => onConfirm()}">确定</div>
  </div>
</div>
<style>
  .mask {
    position: absolute;
    width: 100%;
    height: 100%;
    background-color: #fff;
    opacity: 0.8;
    top: 0;
    left: 0;
  }
	.dialog {
    width: 280px;
    height: 300px;
    z-index: 99;
    position: absolute;
    top: 100px;
    left: 20px;
    box-sizing: border-box;
    padding: 10px 20px;
    background-color: #fff;
    border: 1px solid rgb(230, 217, 217);
    border-radius: 5px;
  }
  .dialog-container {
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
  }
  .display-none {
    display: none;
  }
  .display {
    display: block !important;
  }
  h3 {
    padding: 0;
    margin-top: 5px;
  }
  .wrapper {
    margin-top: 20px;
  }
  .option-wrapper {
    width: 100%;
    height: 60px;
  }
  .label {
    display: inline-block;
    width: 150px
  }
  .select {
    display: inline-block;
  }
  .button-normal {
		margin: 0 auto;
		width: 200px;
    text-shadow: 0 -1px 0 rgb(0 0 0 / 12%);
    box-shadow: 0 2px #0000000b;
    position: relative;
    display: inline-block;
    font-weight: 400;
    white-space: nowrap;
    text-align: center;
    background-image: none;
    border: 1px solid transparent;
    box-shadow: 0 2px #00000004;
    cursor: pointer;
    transition: all .3s cubic-bezier(.645,.045,.355,1);
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
    touch-action: manipulation;
    height: 32px;
		line-height: 32px;
    padding: 4px 15px;
    font-size: 14px;
    border-radius: 2px;
	}
	.primary {
    border-color: #1890ff;
    background: #1890ff;
		color: #fff;
	}
</style>