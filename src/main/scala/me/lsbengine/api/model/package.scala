package me.lsbengine.api

import me.lsbengine.database.model.Post

package object model {

  case class ListActionResponse(list: List[Post])

  case class FetchPostResponse(post: Post)

  case class PostForm(post: Post, csrf: String)

  case class TokenResponse(message: String)

}
