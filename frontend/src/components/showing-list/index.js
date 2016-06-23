import React from 'react';
import ShowingItem from './showing-item';
import loader from '../loader';

import styles from './style.css';

const ShowingList = React.createClass({
  render() {
    const { showings, loading } = this.props;

    return (
      <div className={styles.container}>
        {showings.map(showing => <ShowingItem showing={showing} key={showing.sf_id} />)}
      </div>
    )
  }
})

export default loader((props) => ({
  showings: '/showings'
}))(ShowingList)