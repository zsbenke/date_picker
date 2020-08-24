json.extract! post, :id, :published_at, :title, :body, :created_at, :updated_at
json.url post_url(post, format: :json)
