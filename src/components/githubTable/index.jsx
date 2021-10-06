import React from 'react'
import PropTypes from 'prop-types'
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
// import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';
import { Avatar, Link, makeStyles } from '@material-ui/core';

const tableHeaders = ['Repository', 'Stars', 'Forks', 'Open issues', 'Updated at']

const useStyles = makeStyles({
    container: {
        maxHeight: 440
    }
})

export const GithubTable = ({ reposList }) => {
    const classes = useStyles()
    return (
        <TableContainer className={classes.container}>
            <Table stickyHeader >
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
    )
}

GithubTable.propTypes = {
    reposList: PropTypes.arrayOf(PropTypes.object).isRequired,
}

export default { GithubTable }
