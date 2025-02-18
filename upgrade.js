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
        
        // 在构造函数中调用初始化方法
        this.initGame();
        this.setupEventListeners();  // 添加事件监听器
    }

    initGame() {
        const deck = this.createDeck();
        this.dealCards(deck);
        this.renderGame();
        this.startAITurn();
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

        // 渲染当前出牌
        this.currentTrick.forEach(play => {
            const trickCard = document.getElementById(`trick-${['north', 'east', 'south', 'west'][play.player]}`);
            if (trickCard) {
                trickCard.textContent = play.card.toString();
                trickCard.className = `trick-card ${['north', 'east', 'south', 'west'][play.player]}${play.card.suit === '♥' || play.card.suit === '♦' ? ' red' : ''}`;
            }
        });

        // 更新信息面板
        document.getElementById('level').textContent = this.currentLevel;
        document.getElementById('trump').textContent = this.trumpSuit ? `${this.trumpSuit}${this.trumpRank}` : '等待叫主';
        document.getElementById('current-player').textContent = this.players[this.currentPlayer].name;
        document.getElementById('score-ns').textContent = this.scores[0];
        document.getElementById('score-ew').textContent = this.scores[1];
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
