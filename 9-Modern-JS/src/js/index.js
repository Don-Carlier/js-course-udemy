import Search from './models/Search';
import * as searchView from './views/searchView';
import * as recipeView from './views/recipeView';
import * as listView from './views/listView';
import * as likesView from './views/likesView';
import Recipe from './models/Recipe';
import List from './models/List';
import { elements, renderLoader, clearLoader } from './views/base';
import Likes from './models/Likes';

/* Global state of the app
* - Search object
* - Current recipe object 
* - Shopping list object 
* - Liked recipes */

const state =  {}

const controlSearch = async () => {
    // 1) get query from view
    const query = searchView.getInput();

    if(query) {
        //2) New search object and add to state
        state.search = new Search(query);
        
        //3) Prepare UI for results
        searchView.clearInput();
        searchView.clearResults();
        renderLoader(elements.searchRes);

        try {
            //4) Get searchResults
            await state.search.getResults();

            //5) Render results on UI
            clearLoader();
            searchView.renderResults(state.search.result);
        } catch {
            console.log('something went wrong with searching');
            clearLoader();
        }
    }
}

elements.searchForm.addEventListener('submit', e => {
    e.preventDefault();
    controlSearch();
});

elements.searchResPages.addEventListener('click', e => {
    const btn = e.target.closest('.btn-inline');
    
    if(btn){
        const goToPage = parseInt(btn.dataset.goto, 10);
        searchView.clearResults();
        searchView.renderResults(state.search.result,goToPage);
    }
});


//RECIPE CONTROLLER
const controlRecipe = async () => {
    const id = window.location.hash.replace('#', '');

    if(id) {
        //Prepare UI
        recipeView.clearRecipe();
        renderLoader(elements.recipe);

        //Highlight selected search item
        if (state.search) {
            searchView.highlightedSelected(id);
        }
        // Create recipe object
        state.recipe = new Recipe(id);

        try {
            // Get recipe data and parse ingredients
            await state.recipe.getRecipe();
            state.recipe.parseIngredients();

            // Calculate servings and time
            state.recipe.calcTime();
            state.recipe.calcServings();

            // Render recipe
            clearLoader();
            recipeView.renderRecipe(
                state.recipe,
                state.likes.isLiked(id)
            );

        } catch {
            alert('Error processing recipe!~');
        }
    }
};

['hashchange', 'load'].forEach(event => window.addEventListener(event, controlRecipe));

/* LIST CONTROLLER */
const controlList = () => {
    // Create a new list if there is none yet
    if (!state.list) {
        state.list = new List();
    }

    // Add each ingredient to the list and UI
    state.recipe.ingredients.forEach(el => {
        const item = state.list.addItem(el.count, el.unit, el.ingredient);
        listView.renderItem(item); 
    });
}

// Handle delete and update list item events
elements.shopping.addEventListener('click', e => {
    const id = e.target.closest('.shopping__item').dataset.itemid;
    
    // Handle the delete button
    if (e.target.matches('.shopping__delete, .shopping__delete *')) {
        // Delete from state
        state.list.deleteItem(id);

        //Delete from UI
        listView.deleteItem(id);

        //Handle count update || TODO negative values?
    } else if (e.target.matches('.shopping__count--value')) {
        const val = parseFloat(e.target.value);
        state.list.updateCount(id, val);
    }
}); 

/* LIKE CONTROLLER */
const controlLike = () => {
    const currentID = state.recipe.id;
    if(!state.likes) {
        state.likes = new Likes();
    }
    
    // User hasnt liked current recipe
    if (!state.likes.isLiked(currentID)){
        // Add like to state
            const newLike = state.likes.addLike(
            currentID,
            state.recipe.title,    
            state.recipe.author,    
            state.recipe.img   
        );
        
    // Toggle like button
    likesView.toggleLikeBtn(true);

    // add like to UI list
    likesView.renderLike(newLike);

    // User has liked current recipe

    } else {
        // Remove like from state
        state.likes.deleteLike(currentID);

        // Toggle the like button
        likesView.toggleLikeBtn(false);

        // Remove like from UI list
        likesView.deleteLike(currentID);

    }
    likesView.toggleLikeMenu(state.likes.getNumLikes());
}

// Restore liked recipes on page load
window.addEventListener('load', () => {
    state.likes = new Likes();
    state.likes.readStorage();
    likesView.toggleLikeMenu(state.likes.getNumLikes());

    state.likes.likes.forEach(like => likesView.renderLike(like));
});

// Handling recipe btn clicks
elements.recipe.addEventListener('click', e => {
    if (e.target.matches('.btn-decrease, .btn-decrease *')) {
      if (state.recipe.servings > 1) {
        state.recipe.updateServings('dec'); 
        recipeView.updateServingsIngredients(state.recipe);
      }
    } 
    else if (e.target.matches('.btn-increase, .btn-increase *')) {
        state.recipe.updateServings('inc'); 
        recipeView.updateServingsIngredients(state.recipe);
    } else if ( e.target.matches('.recipe__btn--add, .recipe__btn--add *')) {
        //Add ingredients to shopplinglist
        controlList();     
    } else if (e.target.matches('.recipe__live, .recipe__love *')) {
        // Like controller
        controlLike();
    }  
});
