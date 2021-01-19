<template lang='pug'>
// #firebaseui-auth-container(v-if="!checkUser")
</template>
<script>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import firebase from 'firebase'
// import * as firebaseui from 'firebaseui'
import store from '../store'
// import '../../node_modules/firebaseui/dist/firebaseui.css'
export default {
  name: "GoogleAuth",
  setup () {
    const router = useRouter()
    const checkUser = computed(() => store.getters.checkUser)
    onMounted(async () => {
      // Инициализация и старт представления аутентификации Google
      /* const uiConfig = {
        signInSuccessUrl: '/',
        signInOptions: [
          firebase.auth.GoogleAuthProvider.PROVIDER_ID
        ]
      }
      let ui = firebaseui.auth.AuthUI.getInstance()
      if (!ui) {
        ui = new firebaseui.auth.AuthUI(firebase.auth())
      }
      ui.start('#firebaseui-auth-container', uiConfig) */
      if (!checkUser.value) {
        const provider = new firebase.auth.GoogleAuthProvider()
        provider.addScope('profile')
        provider.addScope('email')
        provider.addScope('openid')
        try {
          firebase.auth().signInWithPopup(provider)
          // await firebase.auth().signInWithRedirect(provider)
        } catch (ex) {
          console.log(ex)
        }
      } else {
        const targetAddress = store.getters.targetAddress
        console.log('targetAddress', targetAddress)
        if(targetAddress){
          router.push({ path: targetAddress.path, query: targetAddress.query })
          await store.dispatch('setTargetAddress', null)
        } else {
          router.push('/')
        }
      }
    })
    return {
      checkUser
    }
  }
}
</script>