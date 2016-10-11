class Showing < ApplicationRecord

  scope :active, -> { where.not(status: :done)}
  enum status: [ :cancelled, :open, :confirmed, :ordered, :done ]
  belongs_to :owner, class_name: User
  belongs_to :movie, foreign_key: :sf_id
  has_many :time_slots, dependent: :destroy
  has_many :attendees
  belongs_to :selected_time_slot, optional: true, class_name: TimeSlot
end
