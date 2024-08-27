import { useState, useEffect, useCallback } from 'react'

// ** Next Imports
import Link from 'next/link'

// ** MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Menu from '@mui/material/Menu'
import Grid from '@mui/material/Grid'
import TextField from '@mui/material/TextField'
import Divider from '@mui/material/Divider'
import { styled } from '@mui/material/styles'
import MenuItem from '@mui/material/MenuItem'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import CardHeader from '@mui/material/CardHeader'
import InputLabel from '@mui/material/InputLabel'
import FormControl from '@mui/material/FormControl'
import CardContent from '@mui/material/CardContent'
import { DataGrid } from '@mui/x-data-grid'
import Select from '@mui/material/Select'
import Button from '@mui/material/Button'

import Icon from 'src/@core/components/icon'

// ** Store Imports
import { useDispatch, useSelector } from 'react-redux'

// ** Custom Components Imports
import CustomChip from 'src/@core/components/mui/chip'
import CustomAvatar from 'src/@core/components/mui/avatar'

// ** Utils Import
import { getInitials } from 'src/@core/utils/get-initials'

// ** Actions Imports
import { fetchData } from 'src/store/apps/user'

// ** Custom Table Components Imports
import TableHeader from 'src/views/apps/user/list/TableHeader'
import AddUserDrawer from 'src/views/apps/user/list/AddUserDrawer'

// ** Vars

const userRoleObj = {
  admin: { icon: 'mdi:laptop', color: 'error.main' },
  author: { icon: 'mdi:cog-outline', color: 'warning.main' },
  editor: { icon: 'mdi:pencil-outline', color: 'info.main' },
  maintainer: { icon: 'mdi:chart-donut', color: 'success.main' },
  subscriber: { icon: 'mdi:account-outline', color: 'primary.main' }
}

const userStatusObj = {
  active: 'success',
  pending: 'warning',
  inactive: 'secondary'
}

const LinkStyled = styled(Link)(({ theme }) => ({
  fontWeight: 600,
  fontSize: '1rem',
  cursor: 'pointer',
  textDecoration: 'none',
  color: theme.palette.text.secondary,
  '&:hover': {
    color: theme.palette.primary.main
  }
}))

// ** renders client column
const renderClient = row => {
  if (row.name.length) {
    return <CustomAvatar src={row.avatar} sx={{ mr: 3, width: 34, height: 34 }} />
  } else {
    return (
      <CustomAvatar
        skin='light'
        color={row.avatarColor || 'primary'}
        sx={{ mr: 3, width: 34, height: 34, fontSize: '1rem' }}
      >
        {getInitials(row.fullName ? row.fullName : 'John Doe')}
      </CustomAvatar>
    )
  }
}

const RowOptions = ({ id, row, onEdit, onSave, onInputChange }) => {
  const [anchorEl, setAnchorEl] = useState(null)
  const rowOptionsOpen = Boolean(anchorEl)
  const [editMode, setEditMode] = useState(false)

  const handleEditClick = () => {
    setEditMode(true)
    onEdit(id)
  }

  const handleSaveClick = async () => {
    try {
      const response = await fetch(`https://658143033dfdd1b11c42c3eb.mockapi.io/signup/UserRegister/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(row)
      })

      if (response.ok) {
        const updatedUser = await response.json()
        console.log('User updated successfully:', updatedUser)
        setEditMode(false)
        onSave(id, row) // Update the data in the parent component
      } else {
        console.error('Failed to update user:', response.status)
      }
    } catch (error) {
      console.error('Error updating the user:', error)
    }
  }

  const handleDelete = async userId => {
    try {
      const response = await fetch(`https://658143033dfdd1b11c42c3eb.mockapi.io/signup/UserRegister/${userId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        console.log(`User with ID ${userId} deleted successfully.`)
      } else {
        console.error(`Failed to delete user with ID ${userId}. Status: ${response.status}`)
      }
    } catch (error) {
      console.error('Error deleting the user:', error)
    }
  }

  return (
    <>
      <IconButton size='small' onClick={e => setAnchorEl(e.currentTarget)}>
        <Icon icon='mdi:dots-vertical' />
      </IconButton>
      <Menu
        keepMounted
        anchorEl={anchorEl}
        open={rowOptionsOpen}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right'
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right'
        }}
        PaperProps={{ style: { minWidth: '8rem' } }}
      >
        <MenuItem component={Link} sx={{ '& svg': { mr: 2 } }} href='/apps/user/view/overview/'>
          <Icon icon='mdi:eye-outline' fontSize={20} />
          View
        </MenuItem>
        {!editMode ? (
          <MenuItem onClick={handleEditClick} sx={{ '& svg': { mr: 2 } }}>
            <Icon icon='mdi:pencil-outline' fontSize={20} />
            Edit
          </MenuItem>
        ) : (
          <MenuItem onClick={handleSaveClick} sx={{ '& svg': { mr: 2 } }}>
            <Icon icon='mdi:content-save-outline' fontSize={20} />
            Save
          </MenuItem>
        )}
        <MenuItem onClick={() => handleDelete(id)} sx={{ '& svg': { mr: 2 } }}>
          <Icon icon='mdi:delete-outline' fontSize={20} />
          Delete
        </MenuItem>
      </Menu>
    </>
  )
}

const columns = [
  {
    flex: 0.2,
    minWidth: 230,
    field: 'fullName',
    headerName: 'User',
    renderCell: ({ row }) => {
      const { fullName, username } = row
      return (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {renderClient(row)}
          <Box sx={{ display: 'flex', alignItems: 'flex-start', flexDirection: 'column' }}>
            <LinkStyled href='/apps/user/view/overview/'>{fullName}</LinkStyled>
            <Typography noWrap variant='caption'>
              {`@${username}`}
            </Typography>
          </Box>
        </Box>
      )
    }
  },
  {
    flex: 0.2,
    minWidth: 250,
    field: 'email',
    headerName: 'Email',
    renderCell: ({ row }) => (
      <TextField
        value={row.email}
        variant='outlined'
        size='small'
        disabled={!row.editable}
        onChange={e => row.onInputChange(e, 'email')}
      />
    )
  },
  {
    flex: 0.15,
    field: 'role',
    minWidth: 150,
    headerName: 'Role',
    renderCell: ({ row }) => (
      <TextField
        value={row.role}
        variant='outlined'
        size='small'
        disabled={!row.editable}
        onChange={e => row.onInputChange(e, 'role')}
      />
    )
  },
  {
    flex: 0.1,
    minWidth: 190,
    headerName: 'Mobile No',
    field: 'currentPlan',
    renderCell: ({ row }) => (
      <TextField
        value={row.phonenumber}
        variant='outlined'
        size='small'
        disabled={!row.editable}
        onChange={e => row.onInputChange(e, 'phonenumber')}
      />
    )
  },
  {
    flex: 0.1,
    minWidth: 110,
    field: 'status',
    headerName: 'Country',
    renderCell: ({ row }) => (
      <CustomChip
        skin='light'
        size='small'
        label={row.country}
        color={userStatusObj[row.status]}
        sx={{ textTransform: 'capitalize', '& .MuiChip-label': { lineHeight: '18px' } }}
      />
    )
  },
  {
    flex: 0.1,
    minWidth: 90,
    sortable: false,
    field: 'actions',
    headerName: 'Actions',
    renderCell: params => (
      <RowOptions
        id={params.row.id}
        row={params.row}
        onEdit={params.row.onEdit}
        onSave={params.row.onSave}
        onInputChange={params.row.onInputChange}
      />
    )
  }
]

const UserList = () => {
  const [editRowId, setEditRowId] = useState(null)
  const [role, setRole] = useState('')
  const [plan, setPlan] = useState('')
  const [value, setValue] = useState('')
  const [status, setStatus] = useState('')
  const [userData, setUserData] = useState([])
  const [filteredUserData, setFilteredUserData] = useState([])
  const [addUserOpen, setAddUserOpen] = useState(false)
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 })
  const [selectedUsers, setSelectedUsers] = useState([])

  const handleEdit = useCallback(id => {
    setEditRowId(id)
    setUserData(prevUserData => prevUserData.map(user => (user.id === id ? { ...user, editable: true } : user)))
  }, [])

  const handleSave = useCallback((id, updatedData) => {
    setUserData(prevUserData =>
      prevUserData.map(user => (user.id === id ? { ...user, ...updatedData, editable: false } : user))
    )
    setEditRowId(null)
  }, [])

  const handleRoleChange = useCallback(e => {
    setRole(e.target.value)
  }, [])

  const handleSearch = useCallback(() => {
    if (!userData || userData.length === 0) return

    setFilteredUserData(
      userData.filter(user => {
        const searchValue = value.toLowerCase()
        return (
          user.name.toLowerCase().includes(searchValue) || user.role.toLowerCase().includes(searchValue)
          // user.plan.toLowerCase().includes(searchValue) ||
          // user.status.toLowerCase().includes(searchValue)
        )
      })
    )
  }, [value, userData])
  const handleFilter = useCallback(
    val => {
      setValue(val)
      handleSearch()
    },
    [handleSearch]
  )

  const handlePlanChange = useCallback(e => {
    setPlan(e.target.value)
  }, [])

  const handleStatusChange = useCallback(e => {
    setStatus(e.target.value)
  }, [])

  useEffect(() => {
    setFilteredUserData(userData.filter(user => (role ? user.role.toLowerCase() === role : true)))
  }, [role, userData])

  useEffect(() => {
    fetch('https://658143033dfdd1b11c42c3eb.mockapi.io/signup/UserRegister')
      .then(response => response.json())
      .then(data => {
        const dataWithEditable = data.map(user => ({
          ...user,
          editable: false,
          onEdit: handleEdit,
          onSave: handleSave,
          onInputChange: (e, field) => handleInputChange(user.id, field, e.target.value)
        }))

        setUserData(dataWithEditable)
        setFilteredUserData(dataWithEditable)
      })
      .catch(error => {
        console.error('Error fetching user data:', error)
      })
  }, [handleEdit, handleSave, addUserOpen])

  useEffect(() => {
    if (userData.length > 0) {
      handleSearch()
    }
  }, [userData, value, handleSearch])

  const toggleAddUserDrawer = () => setAddUserOpen(!addUserOpen)

  const handleInputChange = useCallback((id, field, value) => {
    setUserData(prevUserData => prevUserData.map(user => (user.id === id ? { ...user, [field]: value } : user)))
  }, [])

  const handleDelete = useCallback(() => {
    const remainingUsers = userData.filter(user => !selectedUsers.includes(user.id))

    setUserData(remainingUsers)
    setFilteredUserData(remainingUsers)

    selectedUsers.forEach(id => {
      fetch(`https://658143033dfdd1b11c42c3eb.mockapi.io/signup/UserRegister/${id}`, {
        method: 'DELETE'
      })
        .then(response => {
          if (!response.ok) {
            throw new Error(`Failed to delete user with id ${id}`)
          }
        })
        .catch(error => {
          console.error(error)
        })
    })

    setSelectedUsers([])
  }, [selectedUsers, userData])

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Card>
          <CardHeader title='Search Filter' />
          <CardContent>
            <Grid container spacing={6}>
              <Grid item sm={4} xs={12}>
                <FormControl fullWidth>
                  <InputLabel id='role-select'>Select Role</InputLabel>
                  <Select
                    fullWidth
                    value={role}
                    id='role'
                    label='Select Role'
                    labelId='role-select'
                    onChange={handleRoleChange}
                    inputProps={{ placeholder: 'Select Role' }}
                  >
                    <MenuItem value=''>Select Role</MenuItem>
                    <MenuItem value='admin'>Admin</MenuItem>
                    <MenuItem value='owner'>Owner</MenuItem>
                    <MenuItem value='student'>Student</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              {/* <Grid item sm={4} xs={12}>
                <FormControl fullWidth>
                  <InputLabel id='plan-select'>Select Plan</InputLabel>
                  <Select
                    fullWidth
                    value={plan}
                    id='plan'
                    label='Select Plan'
                    labelId='plan-select'
                    onChange={handlePlanChange}
                    inputProps={{ placeholder: 'Select Plan' }}
                  >
                    <MenuItem value=''>Select Plan</MenuItem>
                    <MenuItem value='basic'>Basic</MenuItem>
                    <MenuItem value='company'>Company</MenuItem>
                    <MenuItem value='enterprise'>Enterprise</MenuItem>
                    <MenuItem value='team'>Team</MenuItem>
                  </Select>
                </FormControl>
              </Grid> */}
              {/* <Grid item sm={4} xs={12}>
                <FormControl fullWidth>
                  <InputLabel id='status-select'>Select Status</InputLabel>
                  <Select
                    fullWidth
                    value={status}
                    id='status'
                    label='Select Status'
                    labelId='status-select'
                    onChange={handleStatusChange}
                    inputProps={{ placeholder: 'Select Status' }}
                  >
                    <MenuItem value=''>Select Status</MenuItem>
                    <MenuItem value='active'>Active</MenuItem>
                    <MenuItem value='pending'>Pending</MenuItem>
                    <MenuItem value='inactive'>Inactive</MenuItem>
                  </Select>
                </FormControl>
              </Grid> */}
            </Grid>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12}>
        <Card>
          <TableHeader value={value} handleFilter={handleFilter} toggle={toggleAddUserDrawer} />
          <DataGrid
            autoHeight
            rows={filteredUserData}
            columns={columns}
            disableRowSelectionOnClick
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            checkboxSelection
            onRowSelectionModelChange={setSelectedUsers}
          />
          {selectedUsers.length > 0 && (
            <Button variant='contained' color='secondary' onClick={handleDelete} style={{ margin: '16px' }}>
              Delete Selected Users
            </Button>
          )}
        </Card>
      </Grid>
      <AddUserDrawer open={addUserOpen} toggle={toggleAddUserDrawer} />
    </Grid>
  )
}

export default UserList
