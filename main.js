//Based off this article: https://www.netlify.com/blog/2019/03/11/deep-dive-how-do-react-hooks-really-work
//In this basic implementation of React, all components should return DOM elements to be appeneded to the root element
const MyReact = (function(rootId)  { //self invoking function
  const rootElement = (
    document.getElementById(rootId || "root") //default to an element with the id "root"
    || document.body //default to the body
  )
  const components = [] //tracks all the components
  const hooks = [] //array holding state values or effect dependency arrays
  let globalHookIndex = 0
  let rerenderTimeout = 0

  function removeAllChildNodes(parent) { //used for clearing the root element
    while (parent.firstChild) {
      parent.removeChild(parent.firstChild)
    }
  }

  function render(FC) { //add a new component to be rendered
    components.push(FC) //add the component to our array
    renderOne(FC) //immediately render this component
  }

  function renderOne(FC) { //render one component
    rootElement.append(FC()) //append the component output to the root element
  }

  function renderAll() { //render all the current components
    //the real React checks the virtual DOM to see if a DOM update is actually necessary
    //but this is good enough for a basic implementation
    removeAllChildNodes(rootElement) //clear the root
    globalHookIndex = 0 //reset the hook index
    components.forEach(renderOne) //render all the components
  }

  return {
    render,
    useEffect(callback, deps) {
      const oldDeps = hooks[globalHookIndex] //will be undefined on first usage
      const depsChanged = ( //true if oldDeps is undefined or some deps are not equal
        !oldDeps //true if oldDeps is undefined
        || oldDeps.some((d,i) => d !== deps[i]) //true if some deps are not equal
      )

      if(!deps || depsChanged) { //if there are no deps OR deps have changed
        callback() //run the callback
        hooks[globalHookIndex] = deps //set the new deps
      }

      globalHookIndex++ //increment to the next index
    },
    useState(initialValue) {
      if(hooks[globalHookIndex] === undefined) { //set the initial value if necessary
        hooks[globalHookIndex] = initialValue
      }

      const localHookIndex = globalHookIndex //copy the hook index to be used in the closure
      const setHook = (newValue) => {
        hooks[localHookIndex] = newValue //set the new value

        clearTimeout(rerenderTimeout) //clear any previous rerender timeouts
        rerenderTimeout = setTimeout(renderAll, 1) //run all the components after the state update
      }
      return [
        hooks[globalHookIndex++], //return the current hook value, also increment to the next index
        setHook
      ]
    }
  }
})()


function Counter() {
  const [count, setCount] = MyReact.useState(0)

  //DOM interactions
  const div = document.createElement("div")

  const button = document.createElement("button")
  button.innerHTML = "Increment"
  button.onclick = () => setCount(count + 1)

  const span = document.createElement("div")
  span.innerHTML = `Current Count: ${count}`

  div.append(button)
  div.append(span)
  div.append(CounterChild({count}))
  return div
}

function CounterChild(props) {
  const { count } = props

  const div = document.createElement("div")
  div.innerHTML = `Your count squared is: ${count * count}`
  return div
}

MyReact.render(Counter)
MyReact.render(TextParent)
