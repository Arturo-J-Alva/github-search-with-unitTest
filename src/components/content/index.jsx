import PropTypes from 'prop-types'
// import Paper from '@material-ui/core/Paper';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
// import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';
import { Avatar, Box, Link, TablePagination, Typography } from '@material-ui/core';

const tableHeaders = ['Repository', 'Stars', 'Forks', 'Open issues', 'Updated at']

function Content({ isSearchApplied, reposList, rowsPerPage, setRowsPerPage }) {

    const handleChangeRowsPage = (event) => {
        setRowsPerPage(event.target.value)
    }

    const renderWithBox = el => {
        return (
            <Box display="flex" alignItems='center' justifyContent="center" height={400}>
                {el}
            </Box>
        )
    }

    if (isSearchApplied && reposList?.length) {
        return <>
            <TableContainer>
                <Table >
                    <TableHead>
                        <TableRow>
                            {
                                tableHeaders.map(name => {
                                    return <TableCell key={name}>{name}</TableCell>
                                })
                            }
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {
                            reposList.map(({
                                name,
                                stargazers_count: stargazersCount,
                                forks_count: forksCount,
                                open_issues: openIssues,
                                updated_at: updatedAt,
                                owner,
                                html_url: htmlUrl }) => {
                                return (
                                    <TableRow key={name}>
                                        <TableCell>
                                            <Avatar src={owner.avatar_url} alt={name} />
                                            <Link href={htmlUrl} >{name}</Link>
                                        </TableCell>
                                        <TableCell>{stargazersCount}</TableCell>
                                        <TableCell>{forksCount}</TableCell>
                                        <TableCell>{openIssues}</TableCell>
                                        <TableCell>{updatedAt}</TableCell>
                                    </TableRow>
                                )
                            })
                        }

                    </TableBody>
                </Table>
            </TableContainer>
            <TablePagination
                rowsPerPageOptions={[30, 50, 100]}
                component="div"
                count={1}
                rowsPerPage={rowsPerPage}
                page={0}
                onPageChange={() => { }}
                onRowsPerPageChange={handleChangeRowsPage}
            />
        </>
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
    rowsPerPage: PropTypes.number.isRequired,
    setRowsPerPage: PropTypes.func.isRequired
}

export default Content
