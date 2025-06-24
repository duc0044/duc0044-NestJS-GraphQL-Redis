import { ref, watch } from 'vue'
import { useQuasar } from 'quasar'
import { useQuery, useMutation } from '@vue/apollo-composable'
import gql from 'graphql-tag'

// TypeScript interfaces
export interface User {
  id: string
  username: string
  email: string
  role: string
}

interface UsersData {
  users: User[]
}

// GraphQL queries and mutations
const GET_USERS = gql`
  query GetUsers {
    users {
      id
      username
      email
      role
    }
  }
`

const CREATE_USER = gql`
  mutation CreateUser($createUserInput: CreateUserInput!) {
    createUser(createUserInput: $createUserInput) {
      id
      username
      email
      role
    }
  }
`

const UPDATE_USER = gql`
  mutation UpdateUser($updateUserId: Int!, $updateUserInput: UpdateUserInput!) {
    updateUser(id: $updateUserId, updateUserInput: $updateUserInput) {
      id
      username
      email
      role
    }
  }
`

const DELETE_USER = gql`
  mutation RemoveUser($removeUserId: Int!) {
    removeUser(id: $removeUserId)
  }
`

export function useUsers() {
  const $q = useQuasar()

  // Reactive data
  const loading = ref(false)
  const users = ref<User[]>([])

  // Pagination
  const pagination = ref({
    sortBy: 'username',
    descending: false,
    page: 1,
    rowsPerPage: 10,
    rowsNumber: 0,
  })

  // GraphQL operations
  const {
    result: usersResult,
    loading: usersLoading,
    refetch: refetchUsers,
  } = useQuery<UsersData>(
    GET_USERS,
    {},
    {
      fetchPolicy: 'network-only',
    },
  )

  const { mutate: createUserMutation } = useMutation(CREATE_USER)
  const { mutate: updateUserMutation } = useMutation(UPDATE_USER)
  const { mutate: deleteUserMutation } = useMutation(DELETE_USER)

  // Watch for query results
  watch(usersResult, (newResult) => {
    if (newResult?.users) {
      users.value = newResult.users
      pagination.value.rowsNumber = newResult.users.length
    }
  })

  watch(usersLoading, (newLoading) => {
    loading.value = newLoading
  })

  // Actions
  const deleteUser = (user: User) => {
    $q.dialog({
      title: 'Xác nhận xóa',
      message: `Bạn có chắc chắn muốn xóa người dùng "${user.username}"?`,
      cancel: true,
      persistent: true,
    }).onOk(() => {
      void (async () => {
        try {
          await deleteUserMutation({
            removeUserId: Number(user.id),
          })
          await refetchUsers()
          $q.notify({
            type: 'positive',
            message: `Đã xóa người dùng ${user.username}`,
            position: 'top',
          })
        } catch (err) {
          console.error('Error deleting user:', err)
          $q.notify({
            type: 'negative',
            message: 'Có lỗi xảy ra khi xóa người dùng',
            position: 'top',
          })
        }
      })()
    })
  }

  const onRequest = (props: {
    pagination: {
      sortBy: string
      descending: boolean
      page: number
      rowsPerPage: number
      rowsNumber?: number
    }
    filter?: unknown
    getCellValue: (col: unknown, row: unknown) => unknown
  }) => {
    pagination.value = {
      ...props.pagination,
      rowsNumber: props.pagination.rowsNumber || 0,
    }
  }

  return {
    // Data
    loading,
    users,
    pagination,

    // Methods
    deleteUser,
    onRequest,
    refetchUsers,

    // Mutations
    createUserMutation,
    updateUserMutation,
  }
}