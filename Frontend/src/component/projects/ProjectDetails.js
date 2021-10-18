import React from 'react';
import PropTypes from 'prop-types';

class ProjectDetails extends React.Component {
    render() {
        return (
            <h2>
                Page about project {this.props.match.params.id}
            </h2>
        );
    }
}

ProjectDetails.propTypes = {
    match: PropTypes.object,
    params: PropTypes.object,
    id: PropTypes.string
};

export default ProjectDetails;