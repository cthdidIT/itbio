import React from 'react';
import loader from '../../loader';

import StatusLabel from './status-label';

import styles from './style.css';

const ShowingItem = React.createClass({
  render() {
    const { showing, movie } = this.props
    return (
      <div className={styles.container}>
        <div className={styles.image} style={{backgroundImage: `url(${movie.poster})`}}></div>
        <div className={styles.description}>
          <h3>{movie.title}</h3>
          <StatusLabel className={styles.label} status={showing.status} />
        </div>
      </div>
    )
  }
})


export default loader((props) => ({
  movie: `/movies/${props.showing.sf_id}`
}))(ShowingItem)