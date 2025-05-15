import { ref, computed } from 'vue'
import { UserService, type IUser, type ICreateUserDto, type IUpdateUserDto } from '../services/api/userService'

// Fonction utilitaire pour assurer que nous envoyons des types corrects au backend
function sanitizeUserData(userData: any): ICreateUserDto | IUpdateUserDto {
  // Clone les données pour éviter de modifier l'original
  const sanitized: any = { ...userData }

  // Assurer que subscriptionType est une valeur simple (string ou null)
  if (sanitized.subscriptionType && typeof sanitized.subscriptionType === 'object') {
    sanitized.subscriptionType = sanitized.subscriptionType.value
  }

  // Assurer que les dates sont correctement formatées
  if (sanitized.subscriptionExpiryDate && typeof sanitized.subscriptionExpiryDate === 'object') {
    // Si c'est un objet Date, le convertir en string ISO
    if (sanitized.subscriptionExpiryDate instanceof Date) {
      sanitized.subscriptionExpiryDate = sanitized.subscriptionExpiryDate.toISOString()
    } else if (sanitized.subscriptionExpiryDate.value) {
      // Pour gérer d'autres objets de date possible (qui ont une propriété value)
      sanitized.subscriptionExpiryDate = sanitized.subscriptionExpiryDate.value
    }
  }

  return sanitized
}

export function useUserManagement(autoLoad = true) {
  const users = ref<IUser[]>([])
  const currentUser = ref<IUser | null>(null)
  const isLoading = ref(false)
  const error = ref<Error | null>(null)

  // Formatage des noms complets
  const formattedUsers = computed(() => {
    return users.value.map((user) => ({
      ...user,
      fullName: `${user.firstName} ${user.lastName}`,
    }))
  })

  // Récupérer tous les utilisateurs
  const fetchUsers = async () => {
    console.log('useUserManagement: fetchUsers - Début du chargement')
    isLoading.value = true
    error.value = null

    try {
      const fetchedUsers = await UserService.getAllUsers()
      console.log('useUserManagement: fetchUsers - Utilisateurs récupérés:', fetchedUsers)

      if (Array.isArray(fetchedUsers)) {
        users.value = fetchedUsers
        console.log('useUserManagement: users.value mis à jour avec', users.value.length, 'utilisateurs')
      } else {
        console.error("useUserManagement: fetchUsers - La réponse n'est pas un tableau:", fetchedUsers)
        error.value = new Error("Format de données invalide: attendu un tableau d'utilisateurs")
      }
    } catch (err) {
      console.error('useUserManagement: fetchUsers - Erreur lors de la récupération:', err)
      error.value =
        err instanceof Error ? err : new Error('Une erreur est survenue lors de la récupération des utilisateurs')
    } finally {
      isLoading.value = false
      console.log('useUserManagement: fetchUsers - Fin du chargement')
    }
  }

  // Récupérer un utilisateur par ID
  const fetchUserById = async (id: string) => {
    isLoading.value = true
    error.value = null

    try {
      currentUser.value = await UserService.getUserById(id)
    } catch (err) {
      error.value =
        err instanceof Error ? err : new Error(`Une erreur est survenue lors de la récupération de l'utilisateur ${id}`)
      console.error(`Error fetching user ${id}:`, err)
    } finally {
      isLoading.value = false
    }
  }

  // Créer un nouvel utilisateur
  const createUser = async (userData: ICreateUserDto) => {
    isLoading.value = true
    error.value = null

    try {
      // Sanitiser les données avant envoi
      const sanitizedData = sanitizeUserData(userData)
      const newUser = await UserService.createUser(sanitizedData)
      users.value.push(newUser)

      // Recharger la liste complète pour être sûr d'avoir les données à jour
      await fetchUsers()

      return newUser
    } catch (err) {
      error.value =
        err instanceof Error ? err : new Error("Une erreur est survenue lors de la création de l'utilisateur")
      console.error('Error creating user:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Mettre à jour un utilisateur
  const updateUser = async (id: string, userData: IUpdateUserDto) => {
    isLoading.value = true
    error.value = null

    try {
      // Sanitiser les données avant envoi
      const sanitizedData = sanitizeUserData(userData)
      const updatedUser = await UserService.updateUser(id, sanitizedData)

      // Recharger la liste complète pour être sûr d'avoir les données à jour
      await fetchUsers()

      if (currentUser.value?.id === id) {
        currentUser.value = updatedUser
      }

      return updatedUser
    } catch (err) {
      error.value =
        err instanceof Error ? err : new Error(`Une erreur est survenue lors de la mise à jour de l'utilisateur ${id}`)
      console.error(`Error updating user ${id}:`, err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Supprimer un utilisateur
  const deleteUser = async (id: string) => {
    isLoading.value = true
    error.value = null

    try {
      await UserService.deleteUser(id)
      users.value = users.value.filter((u) => u.id !== id)

      if (currentUser.value?.id === id) {
        currentUser.value = null
      }

      // Recharger la liste pour être sûr
      await fetchUsers()
    } catch (err) {
      error.value =
        err instanceof Error ? err : new Error(`Une erreur est survenue lors de la suppression de l'utilisateur ${id}`)
      console.error(`Error deleting user ${id}:`, err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Charger automatiquement les utilisateurs si autoLoad est vrai
  if (autoLoad) {
    console.log('useUserManagement: Chargement automatique des utilisateurs activé')
    // Utiliser un petit délai pour s'assurer que le composant est monté
    setTimeout(() => {
      fetchUsers()
    }, 100)
  }

  return {
    users,
    formattedUsers,
    currentUser,
    isLoading,
    error,
    fetchUsers,
    fetchUserById,
    createUser,
    updateUser,
    deleteUser,
  }
}
