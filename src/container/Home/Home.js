import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { bindActionCreators } from "redux";
import {
    clearBeerDetails,
    getAllBeersRequest,
    getCertainBeerRequest,
    getPaginationRequest,
    getRandomBeerRequest, infiniteScrollBeers,
} from "../../store/actions/beerActionCreators";
import {
    beersSelector,
    detailsSelector,
    errorSelector,
    isLoadingSelector,
    pageSelector,
    perPageSelector,
    randomSelector
} from "../../store/selectors/beerSelector";
import Beer from "../../components/Beer/Beer";
import Pagination from "../Pagination/Pagination";
import Spinner from "../../components/Spinner/Spinner";

import './Home.scss';
import Detail from "../../components/Detail/Detail";
import debounce from "lodash.debounce";
import {favouriteListSelector} from "../../store/selectors/favouriteSelector";
import {
    addToFavouriteList,
    clearFavouriteList,
    removeFromFavoriteList
} from "../../store/actions/favoriteActionCreator";
import Error from "../../components/Error/Error";
import {withRouter} from "react-router";

class Home extends Component {
    constructor(props){
        super(props);
        this.state = {areOver: false};
    }

    componentDidMount() {
        const {
            perPage,
            isLoading,
            getAllBeersActionCreator,
            details,
            match : { params }
        } = this.props;

        if (perPage === 25 && !isLoading) {
            getAllBeersActionCreator();
        }
        if(params.id && details.size === 0 && !isLoading) {
            this.handleDetail(params.id, [])
        }
        window.onscroll = debounce(this.infiniteScroll, 300);
    };

    componentWillUnmount() {
        window.onscroll = null;
    }

    handleDetail = (id, history) => {
        this.props.beerDetailActionCreator(parseInt(id), history);
        this.props.getRandomBeerActionCreator();
    };

    drawBeers = () => this.props.beers.map(beer =>
            <Beer
                beer={beer}
                key={beer.get('id')}
                loading={this.props.isLoading}
                handleDetail={this.handleDetail}
                handleFavourite={this.handleFavourite}
                removeFromFavourite={this.removeFromFavourite}
                clearFavourite={this.clearFavourite}
                favouriteList={this.props.favouriteList}
            />);

    handlePagination = (perPage, page) => {
        if (perPage * page > 324) {
            return this.props.paginationActionCreator(perPage, 1)
        }
        this.props.paginationActionCreator(perPage, page)
    };

    infiniteScroll = () => {
        const { isLoading, error, page, perPage, infinitePaginationActionCreator } = this.props;
        const { documentElement } = document;
        if (error || isLoading) return;
        if (window.innerHeight + documentElement.scrollTop === documentElement.offsetHeight) {
            perPage * page > 324 ? this.setState({
                areOver: true
            }) : infinitePaginationActionCreator(perPage, page + 1);
        }
    };

    onClose = history => {
        this.props.clearDetailActionCreator(history)
    };

    handleFavourite = id => {
        const {addToFavoriteActionCreator, beers, favouriteList} = this.props;
        addToFavoriteActionCreator(beers , favouriteList, id)
    };

    removeFromFavourite = removeId => {
        this.props.removeFromFavouritesActionCreator(this.props.favouriteList, removeId)
    };

    drawDetails = () => {
        const { details, random, error, isLoading } = this.props;
        if (!details.size && error) return <Error />;
        if (details.size) {
            return  <Detail
                details={details}
                onClose={this.onClose}
                randomBeers={random}
                handleDetail={this.handleDetail}
                isLoading={isLoading}
            />
        }
    };

    render() {
        const { isLoading } = this.props;
        const { areOver } = this.state;

        return (
            <Fragment>
                <Pagination pagination={this.handlePagination} />
                <div className='beerContainer'>
                    {this.drawBeers()}
                    {isLoading && <Spinner/>}
                    {this.drawDetails()}
                </div>
                {areOver && <p>Beers ended</p>}
            </Fragment>
        )
    }
}

const mapStateToProps = state => ({
    isLoading: isLoadingSelector(state),
    beers: beersSelector(state),
    page: pageSelector(state),
    perPage: perPageSelector(state),
    details: detailsSelector(state),
    random: randomSelector(state),
    error: errorSelector(state),
    favouriteList: favouriteListSelector(state),
});

const mapDispatchToProps = dispatch =>
    bindActionCreators(
        {
            getAllBeersActionCreator: getAllBeersRequest,
            paginationActionCreator: getPaginationRequest,
            infinitePaginationActionCreator: infiniteScrollBeers,
            beerDetailActionCreator: getCertainBeerRequest,
            clearDetailActionCreator: clearBeerDetails,
            getRandomBeerActionCreator: getRandomBeerRequest,
            addToFavoriteActionCreator: addToFavouriteList,
            clearFavoriteActionCreator: clearFavouriteList,
            removeFromFavouritesActionCreator: removeFromFavoriteList
        },
    dispatch
    );

Home.propTypes = {
    isLoading: PropTypes.bool
};

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(Home));
