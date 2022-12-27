import { useState, useEffect} from 'react'

import './App.css';

import pokemonLogo from './images/pokemon_logo.png'

function App() {
  const gameCards = 12

  const [gameStatus, setGameStatus] = useState('off')

  const [cards, setCards] = useState([])

  const [lastClicked, setLastClicked] = useState({})

  const flipAllCards = () => {//flip all the cards
    let cardsCopy = [...cards]//spread the cards const so we can change the flipped status

    cardsCopy.forEach(cardCopy => {//invert the flipped status for each card
      cardCopy.flipped = !cardCopy.flipped
    });
    setCards(cardsCopy)
  }

  const flipCard = (targetIndex, lastClickedIndex = '') => {//flip only one card
    let newIsRevealed = [...cards]//spread the cards const so we can change the flipped status

    if (newIsRevealed[lastClickedIndex]) {//if we have a valid lastClickedIndex
      newIsRevealed[lastClickedIndex].flipped = !newIsRevealed[lastClickedIndex].flipped
    }
    if (newIsRevealed[targetIndex]) {//if we have a valid item
      newIsRevealed[targetIndex].flipped = !newIsRevealed[targetIndex].flipped
    }

    setCards(newIsRevealed)//set again the cards with the new flipped status
  }

  const generateCards = useEffect( () => {//generate the necessary cards for the game
    let ignore = false//just to return a cleaning function

    async function fetchData() {
      const fullList = await fetch('https://pokeapi.co/api/v2/pokemon?offset=0&limit=10000').then((response) => response.json())//get full list of Pokémon
      let newCards = []
      let j = 0

      for (let i = 0; i < (gameCards / 2); i++) {//feed the new array with only the 6 original cards for the game
        let currentNumber = Math.floor(Math.random() * (fullList.count - 1)) + 1 //get a random number using the total Pokémon numbers
        let fetchItem = await fetch(fullList.results[currentNumber].url).then((response) => response.json())//get the Pokémon based on the random number

        for (let k = 0; k < 2; k++) {//iterate twice for each card since we need pairs
          newCards.push({
            cardID: j,
            flipped: false,
            pokemonID: fetchItem.id,
            name: (fetchItem.name).replaceAll('-',' '),
            image: fetchItem.sprites.other['official-artwork'].front_default
          })
          j++
        }
      }
      
      setCards(newCards.sort(() => Math.random() - 0.5))//randomize the order and set the cards in the correct array
    }

    fetchData();

    return () => { ignore = true }

  }, [])

  const startGame = () => {
    let j = 0

    setGameStatus('on')

    flipAllCards()//flip all cards to show their content

    let counter = setInterval(() => {//start a timer to flip back all the cards after 5 seconds
      if (j >= 5 ) {
        flipAllCards()
        clearInterval(counter);
      }
      j++
    }, 1000); 
  }

  const clickedCard = (card) => {
    let targetIndex = cards.indexOf(card)//get the index of the clicked card

    if (cards[targetIndex].flipped === true) return//if that card is already flipped, return

    flipCard(targetIndex)//flip up the clicked card

    if (Object.keys(lastClicked).length !== 0) {//if there is a lastCLicked item check if they match
      checkIfMatches(targetIndex)
    } else {
      setLastClicked({//set a lastClicked item
        targetIndex: targetIndex,
        pokemonID: cards[targetIndex].pokemonID
      })
    }
  }

  const checkIfMatches = (targetIndex) => {
    if (cards[targetIndex].pokemonID === lastClicked.pokemonID) {//if both have the same pokemon ID
      setLastClicked({})
    } else {// no match, turn back both cards and clear the lastClicked item
      setTimeout(() => {
        flipCard(targetIndex, lastClicked.targetIndex)
        setLastClicked({})
      }, 1000);
    }
  }

  return (
    <div className="App">
      {(gameStatus === 'off' ?
        <div className={'start-game' + (gameStatus === 'on' ? ' hide' : '')}>
          <img className='pokemon-logo' src={pokemonLogo} alt='Pokémon Logo'/>
          <button onClick={ startGame }>Start Game</button>
        </div>
      : '')}
      {(gameStatus === 'on' ?
        <div className='grid'>
        {cards.map( (card) => {
            return (
              <div className={'cardBack' + (card.flipped === true ? ' flipped' : '')} onClick={() => clickedCard(card)} key={card.cardID}>
                {(card.flipped === true ? 
                <div className="cardInner">
                  <img className="cardImage" src={card.image} alt="Pokémon"/>
                  <p className="cardName">{card.name}</p>
                </div>
                : '')}
              </div>
            )
          })}
        </div>
      : '')}
    </div>
  );
}

export default App;
