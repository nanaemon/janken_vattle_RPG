
  // ===== 定数 =====
  const handsText = ["グー", "チョキ", "パー"];
  const MAX_HP = 5;

  const DELAY = {
    BGM_START: 500,
    SCREEN_CHANGE_SHORT: 700,
    TURN_EXEC: 300,
    END_MESSAGE: 500,
    END_SCREEN_CHANGE: 1700,
    BUBBLE_HIDE: 1200,
    HEART_APPEAR: 600,
    HEART_MESSAGE: 1200
  };

  // ===== 状態 =====
  let playerHp = MAX_HP;
  let cpuHp = MAX_HP;
  const cpuName = "あいつ";
  const userName = "きみ";

  let bubbleTimerPlayer = null;
  let bubbleTimerCpu = null;

  // ===== 要素参照 =====
  const firstMenuScreen  = document.getElementById("firstMenuScreen");
  const secondMenuScreen = document.getElementById("secondMenuScreen");
  const commandScreen    = document.getElementById("commandScreen");
  const retryScreen      = document.getElementById("retryScreen");
  const postWinScreen    = document.getElementById("postWinScreen");

  const messageBox       = document.getElementById("messageBox");
  const retryMessage     = document.getElementById("retryMessage");
  const postWinMessage   = document.getElementById("postWinMessage");

  const fightBtn         = document.getElementById("fightBtn");
  const runBtn           = document.getElementById("runBtn");
  const fightBtn2        = document.getElementById("fightBtn2");
  const runBtn2          = document.getElementById("runBtn2");
  const retryBtn         = document.getElementById("retryBtn");
  const playAgainBtn     = document.getElementById("playAgainBtn");
  const noMoreFightBtn   = document.getElementById("noMoreFightBtn");

  const playerHpBar      = document.getElementById("playerHpBar");
  const cpuHpBar         = document.getElementById("cpuHpBar");

  const commandButtons   = document.querySelectorAll(".command");
  const handButtons      = commandScreen.querySelectorAll(".command[data-hand]");

  const playerBubble     = document.getElementById("playerBubble");
  const cpuBubble        = document.getElementById("cpuBubble");
  const heart            = document.getElementById("heart");

  // ===== サウンド =====
  const clickSound  = new Audio("sound/click.wav");
  const bgm         = new Audio("sound/battle.mp3");
  const winSound    = new Audio("sound/win.wav");
  const loseSound   = new Audio("sound/lose.wav");
  const aikoSound   = new Audio("sound/aiko.wav");
  const hitSound    = new Audio("sound/hit.wav");

  bgm.loop = true;
  bgm.volume = 0.4;
  clickSound.volume = 0.6;

  // ===== 初期化 =====
  init();

  function init() {
    updateHpBar();
    attachClickSound();
    attachEventHandlers();
  }

  function attachClickSound() {
    commandButtons.forEach(btn => {
      btn.addEventListener("click", () => {
        playClick();
      });
    });
  }

  function attachEventHandlers() {
    // 最初の「たたかう」
    fightBtn.addEventListener("click", () => {
      startBattle(firstMenuScreen);
    });

    // 最初の「にげる」
    runBtn.addEventListener("click", () => {
      showSecondMenu();
    });

    // 「やっぱり たたかう」
    fightBtn2.addEventListener("click", () => {
      startBattle(secondMenuScreen, "あたって くだけても だいじょうぶ。");
    });

    // runBtn2 はクリック不可の演出なのでリスナー無し

    // 負け後の再チャレンジ
    retryBtn.addEventListener("click", () => {
      resetBattleState();
      startBattle(retryScreen, "なんどでも たちあがる！");
    });

    // 勝利後「もういちど たたかう」
    playAgainBtn.addEventListener("click", () => {
      resetBattleState();
      startBattle(postWinScreen, "つぎの しょうぶも まけない！");
    });

    // 勝利後「たたかわない」（エンディング）
    noMoreFightBtn.addEventListener("click", () => {
      finishWithFriendship();
    });

    // じゃんけんの手（グー・チョキ・パー）
    handButtons.forEach(btn => {
      btn.addEventListener("click", () => {
        const userHand = Number(btn.dataset.hand);

        // 少し溜めてからターン開始
        setTimeout(() => {
          playTurn(userHand);
        }, DELAY.TURN_EXEC);
      });
    });
  }

  // ===== 共通ユーティリティ =====
  function playClick() {
    clickSound.currentTime = 0;
    clickSound.play();
  }

  function startBattle(fromScreen, firstMessage) {
    // BGM開始
    setTimeout(() => {
      bgm.currentTime = 0;
      bgm.play();
    }, DELAY.BGM_START);

    // 画面切り替え
    setTimeout(() => {
      fromScreen.classList.add("hidden");
      commandScreen.classList.remove("hidden");
      if (firstMessage) {
        messageBox.textContent = firstMessage;
      }
    }, DELAY.SCREEN_CHANGE_SHORT);
  }

  function showSecondMenu() {
    firstMenuScreen.classList.add("hidden");
    secondMenuScreen.classList.remove("hidden");

    // 一度選んだら戻れない演出
    fightBtn.style.pointerEvents = "none";
    runBtn.style.pointerEvents = "none";
  }

  function resetBattleState() {
    playerHp = MAX_HP;
    cpuHp = MAX_HP;
    updateHpBar();
  }

  function disableAllCommands() {
    commandButtons.forEach(btn => {
      btn.style.pointerEvents = "none";
      btn.style.opacity = "0.6";
    });
  }

  // ===== バトルロジック =====
  function playTurn(userHand) {
    if (playerHp <= 0 || cpuHp <= 0) return;

    const cpuHand = Math.floor(Math.random() * 3);
    const result  = judge(userHand, cpuHand);

    showBubbles(userHand, cpuHand);

    if (result === 0) {
      // プレイヤー勝ち
      cpuHp--;
      messageBox.textContent =
        `${userName}は ${handsText[userHand]}！ ${cpuName}は ${handsText[cpuHand]}！ ${userName}のかち！`;
      hitSound.currentTime = 0;
      hitSound.play();

      cpuHpBar.classList.add("damage");
      setTimeout(() => cpuHpBar.classList.remove("damage"), 300);

    } else if (result === 1) {
      // あいこ
      messageBox.textContent =
        `${userName}は ${handsText[userHand]}！ ${cpuName}は ${handsText[cpuHand]}！ あいこだ。`;
      aikoSound.currentTime = 0;
      aikoSound.play();

    } else {
      // プレイヤー負け
      playerHp--;
      messageBox.textContent =
        `${userName}は ${handsText[userHand]}！ ${cpuName}は ${handsText[cpuHand]}！ まけてしまった…`;
      hitSound.currentTime = 0;
      hitSound.play();

      playerHpBar.classList.add("damage");
      setTimeout(() => playerHpBar.classList.remove("damage"), 300);
    }

    updateHpBar();
    checkEnd();
  }

  function judge(player, cpu) {
    if (player === cpu) return 1; // あいこ
    if (
      (player === 0 && cpu === 1) || // グー vs チョキ
      (player === 1 && cpu === 2) || // チョキ vs パー
      (player === 2 && cpu === 0)    // パー vs グー
    ) {
      return 0; // 勝ち
    }
    return 2;   // 負け
  }

  function updateHpBar() {
    playerHpBar.style.width = (playerHp / MAX_HP * 100) + "%";
    cpuHpBar.style.width    = (cpuHp    / MAX_HP * 100) + "%";
  }

  function checkEnd() {
    if (cpuHp <= 0) {
      handleWin();
    } else if (playerHp <= 0) {
      handleLose();
    }
  }

  function handleWin() {
    setTimeout(() => {
      messageBox.textContent = `${cpuName}は たおれた！ ${userName}のしょうり！`;
      bgm.pause();
      bgm.currentTime = 0;
      winSound.currentTime = 0;
      winSound.play();
    }, DELAY.END_MESSAGE);

    setTimeout(() => {
      commandScreen.classList.add("hidden");
      postWinScreen.classList.remove("hidden");
      postWinMessage.textContent = `${userName}の つよさは じゅうぶんに つたわった。`;
    }, DELAY.END_SCREEN_CHANGE);
  }

  function handleLose() {
    setTimeout(() => {
      bgm.pause();
      bgm.currentTime = 0;
      loseSound.currentTime = 0;
      loseSound.play();
    }, DELAY.END_MESSAGE);

    setTimeout(() => {
      commandScreen.classList.add("hidden");
      retryScreen.classList.remove("hidden");
      retryMessage.textContent = "たちあがれ… かつまで おわれない！";
    }, DELAY.END_SCREEN_CHANGE);
  }

  // ===== 吹き出し・演出 =====
  function showBubbles(userHand, cpuHand) {
    playerBubble.textContent = handsText[userHand];
    cpuBubble.textContent    = handsText[cpuHand];

    playerBubble.classList.remove("hidden");
    cpuBubble.classList.remove("hidden");

    if (bubbleTimerPlayer) clearTimeout(bubbleTimerPlayer);
    if (bubbleTimerCpu)    clearTimeout(bubbleTimerCpu);

    bubbleTimerPlayer = setTimeout(() => {
      playerBubble.classList.add("hidden");
    }, DELAY.BUBBLE_HIDE);

    bubbleTimerCpu = setTimeout(() => {
      cpuBubble.classList.add("hidden");
    }, DELAY.BUBBLE_HIDE);
  }

  function finishWithFriendship() {
    setTimeout(() => {
      heart.classList.remove("hidden");
      heart.classList.add("show");
    }, DELAY.HEART_APPEAR);

    setTimeout(() => {
      disableAllCommands();
      postWinMessage.textContent = "ゆうじょう がめばえた。 ";
    }, DELAY.HEART_MESSAGE);
  }

