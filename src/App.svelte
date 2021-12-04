<script>
	import Header from './header.svelte';
	import Counter from './counter.svelte';
	import CounterNumber from './counter-number.svelte';
	import Dialog from './dialog.svelte';

	// come from: https://cn.knoema.com/atlas/%E4%B8%AD%E5%9B%BD/topics/%E5%81%A5%E5%BA%B7/%E5%81%A5%E5%BA%B7%E7%8A%B6%E5%86%B5/%E5%B9%B3%E5%9D%87%E5%AF%BF%E5%91%BD%E7%94%B7%E6%80%A7
	const YEAR_CONFIG = {
		man: {
			limit: 74.8,
			sick: 74.8 - 67.2, // 平均寿命 - 健康寿命
		}, 
		woman: {
			limit: 79.2,
			sick: 79.2 - 70,
		}
	};
	// pannel choisen
	let bornYear = localStorage.getItem('bornYear') || new Date().getFullYear();
	let bornMonth = localStorage.getItem('bornMonth') || new Date().getMonth() + 1;
	let gender = localStorage.getItem('gender') || 'man';
	
	let updateYear = localStorage.getItem('updateYear') || new Date().getFullYear();
	let updateMonth = localStorage.getItem('updateMonth') || new Date().getMonth() + 1;
	
	let pannelFlag = 1;
	const onChangePannel = (pannel) => pannelFlag = pannel;
	
	let shouldDisplayDialog = !localStorage.getItem('gender');
	const onChangeDisplay = (isDisplay) => shouldDisplayDialog = isDisplay;
	const updateBlock = () => {
		const now = new Date();

		updateYear = now.getFullYear();
		updateMonth = now.getMonth() + 1;
		localStorage.setItem('updateYear', updateYear);
		localStorage.setItem('updateMonth', updateMonth);
	};

	const onSetBasicInfos = ({ year, month, gender: genders }) => {
		console.log('year', year);
		console.log('month', month);
		console.log('genders', genders);
		bornYear = year;
		bornMonth = month;
		gender = genders;
		shouldDisplayDialog = false;
		localStorage.setItem('bornYear', year);
		localStorage.setItem('bornMonth', month);
		localStorage.setItem('gender', genders);
	};
</script>

<main>
	<Header />
	<div class="tab">
		<div class="tab-pannels">
			<div
				class="tab-pannel left-pannel"
				class:active={pannelFlag === 1}
				on:click="{() => onChangePannel(1)}"
			>
				图
			</div>
			<div
				class="tab-pannel right-pannel"
				class:active={pannelFlag === 2}
				on:click="{() => onChangePannel(2)}"
			>
				数
			</div>
		</div>
		{#if pannelFlag === 1}
			<Counter
				bind:yearLimit={YEAR_CONFIG[gender].limit}
				bind:sickYear={YEAR_CONFIG[gender].sick}
				bind:bornYear={bornYear}
				bind:bornMonth={bornMonth}
				bind:currYear={updateYear}
				bind:currMonth={updateMonth}
			/>
		{:else if pannelFlag === 2}
			<CounterNumber
				bind:gender={gender}
				bind:yearLimit={YEAR_CONFIG[gender].limit}
				bind:sickYear={YEAR_CONFIG[gender].sick}
				bind:bornYear={bornYear}
				bind:bornMonth={bornMonth}
			/>
		{/if}
	</div>
	<footer>
		{#if pannelFlag === 1}
			<div class="button-normal primary" on:click="{() => updateBlock()}">更新</div>
		{:else if pannelFlag === 2}
			<div class="button-normal setting" on:click="{() => onChangeDisplay(true)}">重新设置</div>
		{/if}
	</footer>
	<Dialog display={shouldDisplayDialog} onSetBasicInfos={onSetBasicInfos} />
</main>

<style>
	main {
		width: 300px;
		box-sizing: border-box;
		height: 600px;
		overflow: hidden;
		position: relative;
	}
	.tab-pannels {
		width: 90%;
		font-size: 0px;
		margin: 0 auto;
		border-bottom: 1px solid #b1afaf;
	}
	.tab-pannel {
		width: 50%;
		display: inline-block;
		font-size: 20px;
		box-sizing: border-box;
		padding: 0 30px;
		cursor: pointer;
		text-align: center;
	}
	.left-pannel {
		padding-left: 50px;
	}
	.right-pannel {
		padding-right: 50px;
	}
	.tab-pannel:hover {
		background-color: rgb(243, 249, 241);
	}
	.active {
		border-bottom: 1px solid rgb(237, 88, 59);
	}
	footer {
		position: absolute;
		bottom: 20px;
		left: 0;
		width: 100%;
		height: 40px;
		text-align: center;
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
	.primary:hover {
		border-color: #40a9ff;
    background: #40a9ff;
		color: #fff;
	}
	.setting {
		border-color: #ff4d4f;
    background: #fff;
		color: #ff4d4f;
	}
	.setting:hover {
		border-color: #ff7875;
		color: #ff7875;
	}
</style>
