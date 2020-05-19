// Global app controller
import Search from './models/Search'
import Recipe from './models/Recipe'
import List from './models/List'
import Like from './models/Likes'


import * as searchView from './views/searchView'
import * as recipeView from './views/recipeView'
import * as listView from './views/listView'
import * as likesView from './views/likesView'

import {elements,renderLoader,clearLoader } from './views/base'

/** Global state of app
 * search object
 * current recipe object
 * shopping list object
 * liked recipes
 */
const state={

}

/*
Search Controller
*/



const controlSearch=async ()=>{
    //1. get query from view
const query=searchView.getInput();

if(query)
{
    //2.new search object and add to state
     state.search=new Search(query)
    //3.prepare UI for results
    searchView.clearInput()
    searchView.clearResults()
    renderLoader(elements.searchRes) //results not result-list
    //4.search for recipes
   try{

    await state.search.getResults();
    //5.render the results on ui
    clearLoader()
    searchView.renderResults(state.search.results)
   }catch(e){
       alert('Something went wrong')
   }
}
}

elements.searchForm.addEventListener('submit',e=>{
    e.preventDefault()
    controlSearch()
})

elements.searchResPages.addEventListener('click',e=>{
const btn=e.target.closest('.btn-inline')
//console.log(btn)
if(btn){
    const goToPage=parseInt(btn.dataset.goto,10);
     searchView.clearResults()
    searchView.renderResults(state.search.results,goToPage)
   // console.log(goToPage)
}
})

/*
RECIPE CONTROLLER
*/

// const r=new Recipe(35477)
// r.getRecipe();

// console.log(r)
const controlRecipe=async ()=>{
const id=window.location.hash.replace('#','');
    if(id){
        //prepare ui for changes
        recipeView.clearRecipe();
        renderLoader(elements.recipe)

        //highlight selected search controller
        if(state.search) searchView.highlightSelected(id)
        
        //create  new recipe object
        state.recipe=new Recipe(id);
        try{
            //get receipe data and parse ingredient
            await state.recipe.getRecipe();
            
            state.recipe.parseIngredients()
             //calculate serving and timings
                state.recipe.calcTime()
                state.recipe.calcServings();

             //render recipe
               clearLoader();
               recipeView.renderRecipe(
                   state.recipe,
                   state.likes.isLiked(id)
                   
                   )
         }catch(e){
           
                alert('Error processing recipe!',e)
                 }
       
} 
}

// window.addEventListener('hashchange',controlRecipe)
// window.addEventListener('load',controlRecipe)

['hashchange','load'].forEach(event=>window.addEventListener(event,controlRecipe))

/*

LIST CONTOLLER

*/
const controlList=()=>{
    //create a new list if there was none
    if(!state.list) state.list=new List()

    //add each ingredient to the list

    state.recipe.ingredients.forEach(el=>{
       const item= state.list.addItems(el.count,el.unit,el.ingredient)
       listView.renderItem(item)
    })

}


/*
LIKES CONTROLLER

*/

const controlLike=()=>{
if(!state.likes) state.likes=new Like();
const currentId=state.recipe.id;

    //user has not liked current recipe
    if(!state.likes.isLiked(currentId)){
        //add like to the state
        const newLike=state.likes.addLike(
            currentId,
            state.recipe.title,
            state.recipe.author,
            state.recipe.img
        )
        //toggle the like button
        likesView.toggleLikedBtn(true); //true=state.likes.isLiked(currentId)

        //add like to UI 
        likesView.renderLike(newLike)
          
     //user liked the current receipe
    }else{

        //remove like to the state
        state.likes.deleteLike(currentId)
        //toggle the like button
        likesView.toggleLikedBtn(false)

        //remove like to UI 
        likesView.deleteLike(currentId)
    }
    likesView.toggleLikeMenu(state.likes.getNumLikes())

}

//restore likes recipe on page load

window.addEventListener('load',()=>{
    state.likes=new Like();

    //restore likes
    state.likes.readStorage()

    //toggle like menu button
 likesView.toggleLikeMenu(state.likes.getNumLikes())

 //render the existing likes
state.likes.likes.forEach(like=>likesView.renderLike(like));

})




//handle delete and update list item events in list

elements.shopping.addEventListener('click',e=>{
    const id=e.target.closest('.shopping__item').dataset.itemid;
    //handle the delete button
    if(e.target.matches('.shopping__delete,.shopping__delete *')){
        //delete from state
            state.list.deleteItems(id);
        //delete from ui
        listView.deleteItem(id)

        //handle the count update
    }else if(e.target.matches('.shopping__count-value,.shopping__count-value *')){
        const value=parseFloat(e.target.value,10)
        if(value>0){state.list.updateCount(id,value)}
    }
})
 
//handling recipe button click

elements.recipe.addEventListener('click',e=>{
    if(e.target.matches('.btn-decrease,.btn-decrease *')){
        //decrease button is clicked
        if(state.recipe.servings>1){
            state.recipe.updateServings('dec')
            recipeView.updateServingsIngredients(state.recipe)
        }
       

    }else if(e.target.matches('.btn-increase,.btn-increase *')){
        //increase button is clicked
        state.recipe.updateServings('inc')
        recipeView.updateServingsIngredients(state.recipe)

    }else if(e.target.matches('.recipe__btn--add,.recipe__btn--add *')){
        //add ingredient to shopping list
        controlList();
    }else if(e.target.matches('.recipe__love,.recipe__love *')){
        //like controller

        controlLike();
    }
    
})

