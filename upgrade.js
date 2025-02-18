class Card {
    constructor(suit, rank, isJoker = false) {
        this.suit = suit;
        this.rank = rank;
        this.isJoker = isJoker;
        this.isSelected = false;
    }

    toString() {
        if (this.isJoker) {
            return this.rank === 16 ? '大王' : '小王';
        }
        const ranks = {
            1: 'A', 11: 'J', 12: 'Q', 13: 'K'
        };
        return `${this.suit}${ranks[this.rank] || this.rank}`;
    }

    // 判断是否是分牌
    isScoreCard() {
        return this.rank === 5 || this.rank === 10 || this.rank === 13;
    }
}

class Player {
    constructor(name, position, isAI = false) {
        this.name = name;
        this.position = position;
        this.cards = [];
        this.team = position % 2;  // 0是北南队，1是东西队
        this.isAI = isAI;
        this.hiddenCards = [];  // 扣牌
        this.tricks = [];  // 赢得的牌
    }

    // AI玩家的出牌逻辑
    getAIPlay(game) {
        if (game.currentPhase === 'bidding') {
            return this.getAIBid(game);
        } else {
            return this.getAICardPlay(game);
        }
    }

    // AI叫主逻辑
    getAIBid(game) {
        // 统计手牌中的2、3、5的数量
        const bidCards = this.cards.filter(card => 
            !card.isJoker && [2, 3, 5].includes(card.rank)
        );
        
        if (bidCards.length > 0) {
            // 选择数量最多的花色叫主
            const suitCounts = {};
            bidCards.forEach(card => {
                suitCounts[card.suit] = (suitCounts[card.suit] || 0) + 1;
            });
            
            let maxSuit = bidCards[0].suit;
            let maxCount = suitCounts[maxSuit];
            
            for (let suit in suitCounts) {
                if (suitCounts[suit] > maxCount) {
                    maxSuit = suit;
                    maxCount = suitCounts[suit];
                }
            }
            
            return bidCards.find(card => card.suit === maxSuit);
        }
        return null;
    }

    // AI出牌逻辑
    getAICardPlay(game) {
        const validCards = this.cards.filter(card => 
            game.isValidPlay(this, card)
        );
        
        if (validCards.length === 0) return null;
        
        // 如果是第一个出牌
        if (game.currentTrick.length === 0) {
            // 优先出主牌
            const trumpCards = validCards.filter(card => 
                game.isTrump(card)
            );
            if (trumpCards.length > 0) {
                return trumpCards[0];
            }
            // 否则出最小的牌
            return validCards.sort((a, b) => a.rank - b.rank)[0];
        }
        
        // 跟牌
        const firstCard = game.currentTrick[0].card;
        const sameSuitCards = validCards.filter(card => 
            card.suit === firstCard.suit
        );
        
        if (sameSuitCards.length > 0) {
            // 出同花色中最大的
            return sameSuitCards.sort((a, b) => b.rank - a.rank)[0];
        }
        
        // 没有同花色，出最小的
        return validCards.sort((a, b) => a.rank - b.rank)[0];
    }
}

class Game {
    constructor() {
        this.players = [
            new Player('北方', 0),
            new Player('东方', 1, true),
            new Player('南方', 2),
            new Player('西方', 3, true)
        ];
        this.currentLevel = 2;  // 从2开始打
        this.dealer = 0;  // 庄家
        this.currentPlayer = this.dealer;
        this.currentPhase = 'bidding';  // bidding, playing
        this.trumpSuit = null;
        this.trumpRank = null;
        this.bottomCards = [];  // 底牌
        this.currentTrick = [];
        this.scores = [0, 0];  // 两队分数
        this.trickScores = [0, 0];  // 当前局分数
        
        this.initGame();
    }

    initGame() {
        const deck = this.createDeck();
        this.dealCards(deck);
        this.renderGame();
        this.startAITurn();
    }

    createDeck() {
        const deck = [];
        const suits = ['♠', '♥', '♣', '♦'];
        // 创建两副牌
        for (let i = 0; i < 2; i++) {
            for (let suit of suits) {
                for (let rank = 1; rank <= 13; rank++) {
                    deck.push(new Card(suit, rank));
                }
            }
            deck.push(new Card(null, 16, true));  // 大王
            deck.push(new Card(null, 15, true));  // 小王
        }
        return this.shuffle(deck);
    }

    dealCards(deck) {
        // 每人25张牌，8张底牌
        for (let i = 0; i < deck.length - 8; i++) {
            this.players[i % 4].cards.push(deck[i]);
        }
        this.bottomCards = deck.slice(-8);
        
        // 整理手牌
        this.players.forEach(player => this.sortCards(player.cards));
    }

    sortCards(cards) {
        cards.sort((a, b) => {
            if (a.isJoker && b.isJoker) return b.rank - a.rank;
            if (a.isJoker) return -1;
            if (b.isJoker) return 1;
            if (a.suit === b.suit) return a.rank - b.rank;
            return ['♠', '♥', '♣', '♦'].indexOf(a.suit) - ['♠', '♥', '♣', '♦'].indexOf(b.suit);
        });
    }

    handleCardClick(playerIndex, cardIndex) {
        const player = this.players[playerIndex];
        const card = player.cards[cardIndex];

        if (this.currentPhase === 'bidding') {
            if (this.canBid(card)) {
                this.bid(player, cardIndex);
            }
        } else if (this.currentPhase === 'playing') {
            if (this.isValidPlay(player, card)) {
                this.playCard(playerIndex, cardIndex);
            }
        }
    }

    canBid(card) {
        return card.isJoker || [2, 3, 5].includes(card.rank);
    }

    bid(player, cardIndex) {
        const card = player.cards[cardIndex];
        this.trumpSuit = card.suit;
        this.trumpRank = card.rank;
        
        if (card.isJoker) {
            player.hiddenCards.push(...player.cards.splice(cardIndex, 1));
            // 庄家可以看底牌
            if (player.position === this.dealer) {
                this.bottomCards.forEach(card => player.cards.push(card));
                this.sortCards(player.cards);
            }
        }
        
        this.currentPhase = 'playing';
        this.renderGame();
        this.startAITurn();
    }

    isValidPlay(player, card) {
        if (this.currentTrick.length === 0) return true;
        
        const firstCard = this.currentTrick[0].card;
        const hasSameSuit = player.cards.some(c => c.suit === firstCard.suit);
        
        return !hasSameSuit || card.suit === firstCard.suit;
    }

    playCard(playerIndex, cardIndex) {
        const player = this.players[playerIndex];
        const card = player.cards.splice(cardIndex, 1)[0];
        
        this.currentTrick.push({
            player: playerIndex,
            card: card
        });
        
        if (this.currentTrick.length === 4) {
            this.evaluateTrick();
        } else {
            this.currentPlayer = (this.currentPlayer + 1) % 4;
            this.startAITurn();
        }
        
        this.renderGame();
    }

    evaluateTrick() {
        let winner = 0;
        let winningCard = this.currentTrick[0];
        
        // 找出最大的牌
        for (let i = 1; i < this.currentTrick.length; i++) {
            if (this.compareCards(this.currentTrick[i].card, winningCard.card)) {
                winner = i;
                winningCard = this.currentTrick[i];
            }
        }
        
        // 计算分数
        let trickScore = 0;
        this.currentTrick.forEach(play => {
            if (play.card.isScoreCard()) {
                trickScore += play.card.rank === 5 ? 5 : 10;
            }
        });
        
        // 添加到获胜方的分数
        this.trickScores[this.players[winner].team] += trickScore;
        
        // 清空当前轮
        this.currentTrick = [];
        this.currentPlayer = winner;
        
        // 检查是否结束当前局
        if (this.players.every(p => p.cards.length === 0)) {
            this.endRound();
        } else {
            this.startAITurn();
        }
        
        this.renderGame();
    }

    compareCards(card1, card2) {
        const isTrump1 = this.isTrump(card1);
        const isTrump2 = this.isTrump(card2);
        
        if (isTrump1 && !isTrump2) return true;
        if (!isTrump1 && isTrump2) return false;
        
        if (isTrump1 && isTrump2) {
            if (card1.isJoker && card2.isJoker) return card1.rank > card2.rank;
            if (card1.isJoker) return true;
            if (card2.isJoker) return false;
            return card1.rank > card2.rank;
        }
        
        if (card1.suit === card2.suit) {
            return card1.rank > card2.rank;
        }
        
        return false;
    }

    isTrump(card) {
        return card.isJoker || 
               card.suit === this.trumpSuit || 
               card.rank === this.trumpRank;
    }

    endRound() {
        // 计算最终分数
        if (this.trickScores[this.dealer % 2] >= 80) {
            // 庄家队升级
            this.currentLevel++;
        } else {
            // 对方队升级
            this.currentLevel++;
        }
        
        // 更新总分
        this.scores[0] += this.trickScores[0];
        this.scores[1] += this.trickScores[1];
        
        // 重置当前局
        this.trickScores = [0, 0];
        this.dealer = (this.dealer + 1) % 4;
        this.currentPlayer = this.dealer;
        this.currentPhase = 'bidding';
        this.trumpSuit = null;
        this.trumpRank = null;
        
        // 开始新的一局
        this.initGame();
    }

    startAITurn() {
        if (this.players[this.currentPlayer].isAI) {
            setTimeout(() => {
                const player = this.players[this.currentPlayer];
                const card = player.getAIPlay(this);
                if (card) {
                    const cardIndex = player.cards.indexOf(card);
                    if (this.currentPhase === 'bidding') {
                        this.bid(player, cardIndex);
                    } else {
                        this.playCard(this.currentPlayer, cardIndex);
                    }
                }
            }, 1000);
        }
    }
    // 添加事件监听器设置
    setupEventListeners() {
        // 监听卡牌点击
        document.querySelectorAll('.card').forEach(card => {
            card.addEventListener('click', (e) => {
                const playerIndex = parseInt(e.target.dataset.playerIndex);
                const cardIndex = parseInt(e.target.dataset.cardIndex);
                this.handleCardClick(playerIndex, cardIndex);
            });
        });
    }
    renderGame() {
        // 渲染玩家手牌
        this.players.forEach((player, index) => {
            const container = document.getElementById(`cards-${['north', 'east', 'south', 'west'][index]}`);
            if (!container) return;  // 确保元素存在
            
            container.innerHTML = '';
            
            player.cards.forEach((card, cardIndex) => {
                const cardElement = document.createElement('div');
                cardElement.className = 'card' + (card.isSelected ? ' selected' : '');
                cardElement.textContent = card.toString();
                if (['♥', '♦'].includes(card.suit)) {
                    cardElement.classList.add('red');
                }
                
                // 添加数据属性
                cardElement.dataset.playerIndex = index;
                cardElement.dataset.cardIndex = cardIndex;
                
                // 只有当前玩家的牌可以点击
                if (index === this.currentPlayer) {
                    cardElement.style.cursor = 'pointer';
                    cardElement.onclick = () => this.handleCardClick(index, cardIndex);
                }
                
                container.appendChild(cardElement);
            });
        });
    }
}

// 初始化游戏
const game = new Game();

// 添加键盘控制
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        // 空格键结束当前回合
        game.endTrick();
    }
});
