import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import { sortBy } from 'lodash';
import classNames from 'classnames';

const DEFAULT_QUERY = 'redux';
const PATH_BASE = 'https://hn.algolia.com/api/v1';
const PATH_SEARCH = '/search';
const PARAM_SEARCH = 'query=';
const DEFAULT_PAGE = 0;
const PARAM_PAGE = 'page=';
const DEFAULT_HPP = '100';
const PARAM_HPP = 'hitsPerPage=';
const SORTS = {
	NONE: list => list,
	TITLE: list => sortBy(list, 'title'),
	AUTHOR: list => sortBy(list, 'author'),
	COMMENTS: list => sortBy(list, 'num_comments').reverse(),
	POINTS: list => sortBy(list, 'points').reverse(),
};

class App extends Component {
	constructor(props) {
		super(props);

		this.state = {
			results: null,
			query: DEFAULT_QUERY,
			searchKey: '',
			isLoading: false,
			sortKey: 'NONE',
			isSortReverse: false,
		};

		this.setSearchTopStories = this.setSearchTopStories.bind(this);
		this.fetchSearchTopStories = this.fetchSearchTopStories.bind(this);
		this.onSearchChange = this.onSearchChange.bind(this)
			this.onSearchSubmit = this.onSearchSubmit.bind(this)
			this.needsToSearchTopStories = this.needsToSearchTopStories.bind(this);
		this.onSort = this.onSort.bind(this);
	}

	onSort(sortKey) {
		const isSortReverse = this.state.sortKey === sortKey && !this.state.isSortReverse;
		this.setState({ sortKey, isSortReverse });
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
			results : { ...this.state.results, [searchKey]: { hits: updatedHits, page } },
			isLoading: false
		});
	}

	fetchSearchTopStories(query, page) {
		this.setState({ isLoading : true });

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
		const { query, results, searchKey, isLoading, sortKey, isSortReverse } = this.state; 
		const page = ( results && results[searchKey] && results[searchKey].page) || 0;
		const list = ( results && results[searchKey] && results[searchKey].hits) || [];
		return (
				<div className="page">
				<div className="interactions">
				<Search value={query} onChange={this.onSearchChange} onSubmit={this.onSearchSubmit}>
				Search
				</Search>
				</div>
				<Table list={list} sortKey={sortKey} onSort={this.onSort} isSortReverse={isSortReverse}/>
				<div className="interactions">
				<ButtonWithLoading
				isLoading={isLoading}
				onClick={() => this.fetchSearchTopStories(searchKey, page + 1)}>
				More
				</ButtonWithLoading>

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


const Table = ({ list, sortKey, onSort, isSortReverse }) => {
	const sortedList = SORTS[sortKey](list);
	const reverseSortedList = isSortReverse ? sortedList.reverse() : sortedList;

	return(
			<div className="table">
			<div className="table-header">
			<span style={{ width: '40%' }}>
			<Sort sortKey={'TITLE'} onSort={onSort} activeSortKey={sortKey}>Title</Sort>
			</span>
			<span style={{ width: '30%' }}>
			<Sort sortKey={'AUTHOR'} onSort={onSort} activeSortKey={sortKey}>Author</Sort>
			</span>
			<span style={{ width: '15%' }}>
			<Sort sortKey={'COMMENTS'} onSort={onSort} activeSortKey={sortKey}>Comments</Sort>
			</span>
			<span style={{ width: '15%' }}>
			<Sort sortKey={'POINTS'} onSort={onSort} activeSortKey={sortKey}>Points</Sort>
			</span>
			</div>
			{
				reverseSortedList.map((item) =>	
						<div key={item.objectID} className="table-row">
						<span style={{ width: '40%' }}><a href={item.url}>{item.title}></a></span>
						<span style={{ width: '30%' }}>{item.author}</span>
						<span style={{ width: '15%' }}>{item.num_comments}</span>
						<span style={{ width: '15%' }}>{item.points}</span>
						</div>
						)
			}
	</div>
		);
}

const Button = ({ onClick, children, className }) =>
<button onClick={onClick} type="button" className={className}>
{children}
</button>

const withLoading = (Component) => ({ isLoading, ...props }) =>
isLoading ? <Loading /> : <Component { ...props } />;

const Loading = () =>
<div>Loading...</div>

const ButtonWithLoading = withLoading(Button);

const Sort = ({ sortKey, onSort, children, activeSortKey }) => {
	const sortClass = classNames(
			'button-inline', { 'button-active' : sortKey === activeSortKey }
			);

	return (
			<button onClick={() => onSort(sortKey)} className={sortClass} type="button">
			{children}
			</button>
	       );
}

export default App;

export {
	Button,
	Search,
	Table,
};
