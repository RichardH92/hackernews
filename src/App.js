import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

const DEFAULT_QUERY = 'redux';
const PATH_BASE = 'https://hn.algolia.com/api/v1';
const PATH_SEARCH = '/search';
const PARAM_SEARCH = 'query=';
const DEFAULT_PAGE = 0;
const PARAM_PAGE = 'page=';
const DEFAULT_HPP = '100';
const PARAM_HPP = 'hitsPerPage=';

class App extends Component {
	constructor(props) {
		super(props);

		this.state = {
			results: null,
			query: DEFAULT_QUERY,
			searchKey: '',
		};

		this.setSearchTopStories = this.setSearchTopStories.bind(this);
		this.fetchSearchTopStories = this.fetchSearchTopStories.bind(this);
		this.onSearchChange = this.onSearchChange.bind(this)
		this.onSearchSubmit = this.onSearchSubmit.bind(this)
		this.needsToSearchTopStories = this.needsToSearchTopStories.bind(this);
	}

	needsToSearchTopStories(query) {
		return !this.state.results[query];
	}

	onSearchSubmit(event) {
		const { query } = this.state;
		this.setState({ searchKey : query });
		if (this.needsToSearchTopStories(query)) {
			this.fetchSearchTopStories(query, DEFAULT_PAGE);
		}

		event.preventDefault();
	}

	setSearchTopStories(result) {
		const { hits, page } = result;
		const { searchKey } = this.state;
		
		const oldHits = page === 0 ? [] : this.state.results[searchKey].hits;
		const updatedHits = [ ...oldHits, ...hits ];

		this.setState({
			results : { ...this.state.results, [searchKey]: { hits: updatedHits, page } }
		});
	}

	fetchSearchTopStories(query, page) {
		fetch(`${PATH_BASE}${PATH_SEARCH}?${PARAM_SEARCH}${query}&${PARAM_PAGE}${page}&${PARAM_HPP}${DEFAULT_HPP}`)
			.then(response => response.json())
			.then(result => this.setSearchTopStories(result));
	}

	componentDidMount() {
		const { query } = this.state;
		this.setState({ searchKey : query });
		this.fetchSearchTopStories(query, DEFAULT_PAGE);
	}

	onSearchChange(event) {
		this.setState({query: event.target.value});
	}

	render() {
		const { query, results, searchKey } = this.state; 
		const page = ( results && results[searchKey] && results[searchKey].page) || 0;
		const list = ( results && results[searchKey] && results[searchKey].hits) || [];
		return (
			<div className="page">
			<div className="interactions">
			<Search value={query} onChange={this.onSearchChange} onSubmit={this.onSearchSubmit}>
			Search
			</Search>
			</div>
			<Table list={list} />
			<div className="interactions">
				<Button onClick={() => this.fetchSearchTopStories(searchKey, page + 1)}>More</Button>
			</div>
			</div>

		);
	}
}

const Search = ({ value, onChange, onSubmit, children }) =>
	<form onSubmit={onSubmit}>
		<input type="text" value={value} onChange={onChange} />
		<button type="submit">{children}</button>
		</form>


const Table = ({ list, pattern }) =>
	<div className="table">
	{
		list.map((item) =>	
			<div key={item.objectID} className="table-row">
			<span style={{ width: '40%' }}><a href={item.url}>{item.title}></a></span>
			<span style={{ width: '30%' }}>{item.author}</span>
			<span style={{ width: '15%' }}>{item.num_comments}</span>
			<span style={{ width: '15%' }}>{item.points}</span>
			</div>
		)
	}
	</div>

const Button = ({ onClick, children }) =>
	<button onClick={onClick} type="button">
	{children}
	</button>


export default App;
