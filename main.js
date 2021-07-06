console.log("HELLOW")

//Based off this article: https://www.netlify.com/blog/2019/03/11/deep-dive-how-do-react-hooks-really-work
const MyReact = (function()  { //self invoking function
  const hooks = []
  let globalHookIndex = 0

  return {
    render(Component) {
      const comp = Component()
      comp.render()
      globalHookIndex = 0
      return comp
    },
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
      const setHook = (newValue) => hooks[localHookIndex] = newValue //set the new value
      return [
        hooks[globalHookIndex++], //return the current hook value, also increment to the next index
        setHook
      ]
    }
  }
})()
function MyComponent() {
  const [count, setCount] = MyReact.useState(0)
  const [text, setText] = MyReact.useState('foo') // 2nd state hook!
  MyReact.useEffect(() => {
    console.log('effect', count, text)
  }, [count, text])
  return {
    click: () => setCount(count + 1),
    type: txt => setText(txt),
    noop: () => setCount(count),
    render: () => {
      console.log("HELLO?")
      document.getElementById("root").innerHTML = JSON.stringify({ count, text })
    }
  }
}

const App = MyReact.render(MyComponent)