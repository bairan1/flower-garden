class Card {
    constructor(suit, rank, isJoker = false) {
        this.suit = suit;
        this.rank = rank;
        this.isJoker = isJoker;
        this.selected = false;
    }

    toString() {
        if (this.isJoker) {
            return this.rank === 16 ? '🃏' : '👑';
        }
        const ranks = {
            1: 'A', 11: 'J', 12: 'Q', 13: 'K'
        };
        return `${this.suit}${ranks[this.rank] || this.rank}`;
    }
}

class Player {
    constructor(name, position) {
        this.name = name;
        this.position = position;
        this.cards = [];
        this.hiddenCards = [];
        this.team = position % 2;  // 0是北南队，1是东西队
    }
}

class Game {
    constructor() {
        this.players = [
            new Player('北方', 0),
            new Player('东方', 1),
            new Player('南方', 2),
            new Player('西方', 3)
        ];
        this.currentPlayer = 0;
        this.currentPhase = 'bidding'; // bidding, playing
        this.trumpSuit = null;
        this.trumpRank = null;
        this.currentTrick = [];
        this.scores = [0, 0];
        this.initGame();
    }

    initGame() {
        const deck = this.createDeck();
        this.dealCards(deck);
        this.renderGame();
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
            deck.push(new Card(null, 16, true)); // 大王
            deck.push(new Card(null, 15, true)); // 小王
        }
        return this.shuffle(deck);
    }

    shuffle(deck) {
        for (let i = deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [deck[i], deck[j]] = [deck[j], deck[i]];
        }
        return deck;
    }

    dealCards(deck) {
        // 每人27张牌
        for (let i = 0; i < deck.length; i++) {
            this.players[i % 4].cards.push(deck[i]);
        }
        // 整理手牌
        this.players.forEach(player => this.sortCards(player.cards));
    }

    sortCards(cards) {
        cards.sort((a, b) => {
            if (a.isJoker && b.isJoker) return b.rank - a.rank;
            if (a.isJoker) return -1;
            if (b.isJoker) return 1;
            if (a.suit === b.suit) return b.rank - a.rank;
            return ['♠', '♥', '♣', '♦'].indexOf(a.suit) - ['♠', '♥', '♣', '♦'].indexOf(b.suit);
        });
    }

    renderGame() {
        // 渲染玩家手牌
        this.players.forEach((player, index) => {
            const container = document.getElementById(`cards-${['north', 'east', 'south', 'west'][index]}`);
            container.innerHTML = '';
            
            player.cards.forEach((card, cardIndex) => {
                const cardElement = document.createElement('div');
                cardElement.className = 'card' + (card.selected ? ' selected' : '');
                cardElement.textContent = card.toString();
                if (['♥', '♦'].includes(card.suit)) {
                    cardElement.style.color = 'red';
                }
                
                // 只有当前玩家的牌可以点击
                if (index === this.currentPlayer) {
                    cardElement.onclick = () => this.handleCardClick(index, cardIndex);
                }
                
                container.appendChild(cardElement);
            });
        });

        // 更新信息面板
        document.getElementById('trump').textContent = this.trumpSuit ? 
            `${this.trumpSuit}${this.trumpRank}` : '等待叫主';
        document.getElementById('current-player').textContent = 
            this.players[this.currentPlayer].name;
        document.getElementById('score-ns').textContent = this.scores[0];
        document.getElementById('score-ew').textContent = this.scores[1];
    }

    handleCardClick(playerIndex, cardIndex) {
        const player = this.players[playerIndex];
        const card = player.cards[cardIndex];

        if (this.currentPhase === 'bidding') {
            // 叫主阶段
            if (this.canBid(card)) {
                this.trumpSuit = card.suit;
                this.trumpRank = card.rank;
                this.currentPhase = 'playing';
                if (card.isJoker) {
                    player.hiddenCards.push(...player.cards.splice(cardIndex, 1));
                }
            }
        } else {
            // 出牌阶段
            if (this.isValidPlay(player, card)) {
                this.playCard(playerIndex, cardIndex);
            }
        }

        this.renderGame();
    }

    canBid(card) {
        return card.isJoker || [2, 3, 5].includes(card.rank);
    }

    isValidPlay(player, card) {
        if (this.currentTrick.length === 0) return true;
        const firstCard = this.currentTrick[0].card;
        const hasSameSuit = player.cards.some(c => c.suit === firstCard.suit);
        return !hasSameSuit || card.suit === firstCard.suit;
    }

    playCard(playerIndex, cardIndex) {
        const player = this.players[playerIndex];
        this.currentTrick.push({
            player: playerIndex,
            card: player.cards.splice(cardIndex, 1)[0]
        });

        if (this.currentTrick.length === 4) {
            this.evaluateTrick();
        } else {
            this.currentPlayer = (this.currentPlayer + 1) % 4;
        }
    }

    evaluateTrick() {
        let winner = 0;
        let winningCard = this.currentTrick[0];

        for (let i = 1; i < this.currentTrick.length; i++) {
            if (this.compareCards(this.currentTrick[i].card, winningCard.card)) {
                winner = i;
                winningCard = this.currentTrick[i];
            }
        }

        this.scores[this.players[winner].team]++;
        this.currentTrick = [];
        this.currentPlayer = winner;
        this.renderGame();
    }

    compareCards(card1, card2) {
        const isTrump1 = card1.isJoker || card1.suit === this.trumpSuit || card1.rank === this.trumpRank;
        const isTrump2 = card2.isJoker || card2.suit === this.trumpSuit || card2.rank === this.trumpRank;

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
}

// 初始化游戏
const game = new Game();

// 添加键盘控制
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        // 空格键结束当前回合
        game.evaluateTrick();
    }
});
