# QuickNote

QuickNote is a simple and intuitive mobile-friendly note editor.

It's my first project involving Node.js. Please leave comments and suggestions!


[Go to QuickNote!](https://quicknote3.herokuapp.com/ "QuickNote")



**Features:**
 * Dynamic local sign up and login functionality &nbsp;&nbsp;
 * sign up and password reset email support
 * Facebook login
 * Automatically generated "Read more" button &nbsp;&nbsp;(*depending on paragraph's length*)
 * Dynamic note size
 * Create, read, edit and delete notes
 * Autosave notes when creating new notes
 * Sort notes by modification date/ title
 * Automatically load the next note upon deleting note
 * Keyboard shortcuts (listed in tooltips upon hovering the respective buttons)


**Future updates:**
* Profile photos availability
* Todo List
* Poor practice optimizations:
    * template engine and ajax rendering the same content at "/notes" route (notes.ejs)
    * use aggregate framework instead of arrays.sort at notes.ejs
    


**Technologies and libraries used:**
* jQuery
* Node.js
* Express framework
* MongoDB



