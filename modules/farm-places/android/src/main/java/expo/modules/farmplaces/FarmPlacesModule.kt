package expo.modules.farmplaces

import android.content.pm.PackageManager
import com.google.android.gms.common.api.ApiException
import com.google.android.libraries.places.api.Places
import com.google.android.libraries.places.api.model.AutocompleteSessionToken
import com.google.android.libraries.places.api.model.Place
import com.google.android.libraries.places.api.net.FetchPlaceRequest
import com.google.android.libraries.places.api.net.FindAutocompletePredictionsRequest
import com.google.android.libraries.places.api.net.PlacesClient
import expo.modules.kotlin.Promise
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class FarmPlacesModule : Module() {
  private val lock = Any()
  private var sessionToken: AutocompleteSessionToken? = null

  override fun definition() = ModuleDefinition {
    Name("FarmPlaces")

    AsyncFunction("autocomplete") { query: String, promise: Promise ->
      val client = placesClient(promise) ?: return@AsyncFunction
      val token = synchronized(lock) {
        sessionToken ?: AutocompleteSessionToken.newInstance().also { sessionToken = it }
      }
      val request = FindAutocompletePredictionsRequest.builder()
        .setQuery(query)
        .setCountries(listOf("ID"))
        .setSessionToken(token)
        .build()

      client.findAutocompletePredictions(request)
        .addOnSuccessListener { response ->
          promise.resolve(response.autocompletePredictions.map { prediction ->
            mapOf(
              "placeId" to prediction.placeId,
              "primaryText" to prediction.getPrimaryText(null).toString(),
              "secondaryText" to prediction.getSecondaryText(null).toString(),
              "fullText" to prediction.getFullText(null).toString()
            )
          })
        }
        .addOnFailureListener { error -> rejectPlacesError(promise, error) }
    }

    AsyncFunction("fetchPlace") { placeId: String, promise: Promise ->
      val client = placesClient(promise) ?: return@AsyncFunction
      val token = synchronized(lock) { sessionToken }
      val builder = FetchPlaceRequest.builder(
        placeId,
        listOf(Place.Field.LOCATION, Place.Field.FORMATTED_ADDRESS)
      )
      if (token != null) builder.setSessionToken(token)

      client.fetchPlace(builder.build())
        .addOnSuccessListener { response ->
          synchronized(lock) { sessionToken = null }
          val location = response.place.location
          if (location == null) {
            promise.reject("ERR_PLACE_LOCATION", "Google Places tidak mengembalikan koordinat tempat ini.", null)
          } else {
            promise.resolve(
              mapOf(
                "latitude" to location.latitude,
                "longitude" to location.longitude,
                "address" to (response.place.formattedAddress ?: "")
              )
            )
          }
        }
        .addOnFailureListener { error ->
          synchronized(lock) { sessionToken = null }
          rejectPlacesError(promise, error)
        }
    }

    AsyncFunction("resetSession") {
      synchronized(lock) { sessionToken = null }
    }
  }

  private fun placesClient(promise: Promise): PlacesClient? {
    val context = appContext.reactContext?.applicationContext
    if (context == null) {
        promise.reject("ERR_PLACES_CONTEXT", "Konteks aplikasi Android tidak tersedia.", null)
      return null
    }
    return try {
      val appInfo = context.packageManager.getApplicationInfo(context.packageName, PackageManager.GET_META_DATA)
      val apiKey = appInfo.metaData?.getString("com.google.android.geo.API_KEY")
      if (apiKey.isNullOrBlank()) {
        promise.reject("ERR_PLACES_API_KEY", "API key Google Maps tidak ditemukan di konfigurasi Android.", null)
        return null
      }
      if (!Places.isInitialized()) Places.initializeWithNewPlacesApiEnabled(context, apiKey)
      Places.createClient(context)
    } catch (error: Exception) {
      promise.reject("ERR_PLACES_INIT", error.message ?: "Google Places gagal diinisialisasi.", error)
      null
    }
  }

  private fun rejectPlacesError(promise: Promise, error: Exception) {
    val status = (error as? ApiException)?.statusCode?.let { " (kode $it)" } ?: ""
    promise.reject("ERR_PLACES_REQUEST", "Permintaan Google Places gagal$status: ${error.localizedMessage ?: "kesalahan tidak diketahui"}", error)
  }
}
