import React from 'react'
import ReactDOMServer from 'react-dom/server.js'

const Del = ({ children }) => (
  <span style={{ paddingTop: '1px', paddingBottom: '3px', background: 'red' }}>
    {children}
  </span>
)
const Add = ({ children }) => (
  <span style={{ paddingTop: '1px', paddingBottom: '3px', background: 'blue' }}>
    {children}
  </span>
)
const patcom = (
  <pre
    style={{
      display: 'grid',
      gridAutoFlow: 'column',
      gridTemplateColumns: '1fr 1fr',
      gridTemplateRows: 'repeat(13, 1fr)',
      background: 'black',
      color: 'white',
      padding: '10px',
    }}
  >
    <div>
      match (res) <Del>{'{'}</Del>
    </div>
    <div>
      {'  '}when ({'{'} status: 200, body, <Del>...</Del>rest {'}'}
      <Del>):</Del>
    </div>
    <div>
      {'    '}
      handleData(body, rest)
    </div>
    <div></div>
    <div>
      {'  '}when ({'{'} status, destination: <Del>url</Del> {'}'}
      <Del>
        ) if (300 {'<'}= status && status {'<'} 400):
      </Del>
    </div>
    <div>{'    '}handleRedirect(url)</div>
    <div></div>
    <div>
      {'  '}when ({'{'} status: 500 {'}'}
      <Del>) if (</Del>!this.hasRetried<Del>): do </Del>
      {'{'}
    </div>
    <div>{'    '}retry(req)</div>
    <div>{'    '}this.hasRetried = true</div>
    <div>
      {'  '}
      {'}'}
    </div>
    <div>
      {'  '}
      <Del>default:</Del> throwSomething()
    </div>
    <div>
      <Del>{'}'}</Del>
    </div>

    <div>
      match (res) <Add>(</Add>
    </div>
    <div>
      {'  '}
      when ({'{'} status: 200, body<Add>: defined</Add>, rest {'}'}
      <Add>
        , ({'{'} body, rest {'}'}) ={'>'}
      </Add>
    </div>
    <div>
      {'    '}
      handleData(body, rest)
    </div>
    <div>
      {'  '}
      <Add>),</Add>
    </div>
    <div>
      {'  '}
      when ({'{'} status<Add>: between(300, 400)</Add>, destination:{' '}
      <Add>defined</Add> {'}'}
      <Add>
        , ({'{'} destination: url {'}'}) ={'>'}
      </Add>
    </div>
    <div>
      {'    '}
      handleRedirect(url)
    </div>
    <div>
      {'  '}
      <Add>),</Add>
    </div>
    <div>
      {'  '}
      when ({'{'} status: 500 {'}'}
      <Add>, () ={'>'} </Add>!this.hasRetried<Add>, () ={'>'} </Add>
      {'{'}
    </div>
    <div>
      {'    '}
      retry(req)
    </div>
    <div>
      {'    '}
      this.hasRetried = true
    </div>
    <div>
      {'  '}
      {'}'}
      <Add>),</Add>
    </div>
    <div>
      {'  '}
      <Add>otherwise (() ={'>'}</Add> throwSomething()<Add>)</Add>
    </div>
    <div>
      <Add>)</Add>
    </div>
  </pre>
)

console.log(ReactDOMServer.renderToStaticMarkup(patcom))
