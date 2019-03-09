var SuggestionModule = (function(props) {

  let $search = props.search, $list = props.list
  let asyncF = props.async

  $search.addEventListener('input', showSuggestions)
  $list.addEventListener('focusout', () => setTimeout(emptySuggestionList, 100))

  function emptySuggestionList() { $list.innerHTML = '' }

  function showSuggestions(e) {
    if (!e.target.value) return
    asyncF(e.target.value).then(results => {
      emptySuggestionList()
      results.query.search.slice(0, 5).map(page => addSuggestion(page))
    });

    function addSuggestion(page) {
      $list.appendChild(makeDiv(page.title))

      function makeDiv(title) {
        let div = document.createElement('div');
        div.addEventListener('click', suggestionClicked)
        div.innerText = title;
        return div
      }
    }
  }

  function suggestionClicked(e) {
    $search.value = e.target.innerText
    emptySuggestionList();
  }

  return {
    suggestionsClick: suggestionClicked
  }

})

module.exports = SuggestionModule