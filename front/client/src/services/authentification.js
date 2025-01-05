import api from './Api'

export default {
    register(credentials){
        return api().post('register', credentials)
    }
}
