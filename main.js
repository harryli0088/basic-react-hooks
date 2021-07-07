console.log("HELLOW")

//Based off this article: https://www.netlify.com/blog/2019/03/11/deep-dive-how-do-react-hooks-really-work
const MyReact = (function()  { //self invoking function
  const components = [] //tracks all the components
  const hooks = [] //array holding state values or effect dependency arrays
  let globalHookIndex = 0
  let rerenderTimeout = 0

  function removeAllChildNodes(parent) {
    while (parent.firstChild) {
      parent.removeChild(parent.firstChild);
    }
}

  function render(FC) {
    components.push(FC) //add the component to our array
    return renderComp(FC)
  }

  function renderComp(FC) {
    const comp = FC() //run the functional component
    comp.render() //render the component
    globalHookIndex = 0 //resent the hook index
    return comp
  }

  function renderAll() {
    removeAllChildNodes(document.getElementById("root"))
    globalHookIndex = 0 //reset the hook index
    components.forEach(renderComp)
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


function MyComponent() {
  const [count, setCount] = MyReact.useState(0)
  return {
    render: () => {
      const button = document.createElement("button")
      button.innerHTML = "Testing"
      button.onclick = () => setCount(count + 1)

      const div = document.createElement("div")
      div.innerHTML = JSON.stringify({ count })

      document.getElementById("root").append(button)
      document.getElementById("root").append(div)
    }
  }
}

MyReact.render(MyComponent)
