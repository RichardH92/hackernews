import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

const DEFAULT_QUERY = 'redux';
const PATH_BASE = 'https://hn.algolia.com/api/v1';
const PATH_SEARCH = '/search';
const PARAM_SEARCH = 'query=';

const isSearched = (query) => (item) => !query || item.title.toLowerCase().indexOf(query.toLowerCase()) !== -1;

class App extends Component {
	constructor(props) {
		super(props);

		this.state = {
			result: null,
			query: DEFAULT_QUERY,
		};

		this.setSearchTopStories = this.setSearchTopStories.bind(this);
		this.fetchSearchTopStories = this.fetchSearchTopStories.bind(this);
		this.onSearchChange = this.onSearchChange.bind(this)
	}

	setSearchTopStories(result) {
		this.setState({ result });
	}

	fetchSearchTopStories(query) {
		fetch(`${PATH_BASE}${PATH_SEARCH}?${PARAM_SEARCH}${query}`)
			.then(response => response.json())
			.then(result => this.setSearchTopStories(result));
	}

	componentDidMount() {
		const { query } = this.state;
		this.fetchSearchTopStories(query);
	}

	onSearchChange(event) {
		this.setState({query: event.target.value});
		const { query } = this.state;
		this.fetchSearchTopStories(query);
	}

	render() {
		const { query, result } = this.state; 
		return (
			<div className="page">
			<div className="interactions">
			<Search value={query} onChange={this.onSearchChange} >
			Search
			</Search>
			</div>
			{ result ? <Table list={result.hits} pattern={query} /> : null }
			</div>

		);
	}
}

const Search = ({ value, onChange, children }) =>
	<form>
	{children}
		<input type="text" value={value} onChange={onChange} />
	</form>


		const Table = ({ list, pattern }) =>
	<div className="table">
	{
		list.filter(isSearched(pattern)).map((item) =>
			<div key={item.objectID} className="table-row">
			<span style={{ width: '40%' }}><a href={item.url}>{item.title}></a></span>
			<span style={{ width: '30%' }}>{item.author}</span>
			<span style={{ width: '15%' }}>{item.num_comments}</span>
			<span style={{ width: '15%' }}>{item.points}</span>
			</div>
		)
	}
		</div>

	export default App;
