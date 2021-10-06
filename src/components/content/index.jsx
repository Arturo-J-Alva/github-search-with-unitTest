import PropTypes from 'prop-types'

import { Box, Typography } from '@material-ui/core';

function Content({ isSearchApplied, reposList, children }) {


    const renderWithBox = el => {
        return (
            <Box display="flex" alignItems='center' justifyContent="center" height={400}>
                {el}
            </Box>
        )
    }


    if (isSearchApplied && reposList?.length) {
        return children
    }
    if (isSearchApplied && !reposList?.length) {
        return (
            renderWithBox(<Typography>
                You search has no results
            </Typography>)
        )
    }

    return (
        renderWithBox(<Typography>
            Please provide a search option and click in the search button
        </Typography>)
    )

}

Content.propTypes = {
    isSearchApplied: PropTypes.bool.isRequired,
    reposList: PropTypes.arrayOf(PropTypes.object).isRequired,
    children: PropTypes.node.isRequired
}

export default Content
