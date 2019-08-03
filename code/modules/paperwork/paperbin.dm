/obj/item/paper_bin
	name = "paper bin"
	icon = 'icons/obj/items/paper.dmi'
	icon_state = "paper_bin1"
	item_state = "sheet-metal"
	throwforce = 1
	w_class = WEIGHT_CLASS_NORMAL
	throw_speed = 3
	throw_range = 7
	layer = LOWER_ITEM_LAYER
	var/amount = 30					//How much paper is in the bin.
	var/list/papers = new/list()	//List of papers put in the bin for reference.


/obj/item/paper_bin/MouseDrop(atom/over_object)
	if(over_object == usr && ishuman(usr) && !usr.restrained() && !usr.stat && (loc == usr || in_range(src, usr)))
		if(!usr.get_active_held_item())		//if active hand is empty
			attack_hand(usr, 1, 1)

	return


/obj/item/paper_bin/attack_paw(mob/living/carbon/monkey/user)
	return attack_hand(user)


/obj/item/paper_bin/attack_hand(mob/living/user)
	. = ..()
	if(.)
		return
	var/response = ""
	if(!papers.len > 0)
		response = alert(user, "Do you take regular paper, or Carbon copy paper?", "Paper type request", "Regular", "Carbon-Copy", "Cancel")
		if (response != "Regular" && response != "Carbon-Copy")
			return
	if(amount >= 1)
		amount--
		if(amount==0)
			update_icon()

		var/obj/item/paper/P
		if(papers.len > 0)	//If there's any custom paper on the stack, use that instead of creating a new paper.
			P = papers[papers.len]
			papers.Remove(P)
		else
			if(response == "Regular")
				P = new /obj/item/paper
			else if (response == "Carbon-Copy")
				P = new /obj/item/paper/carbon

		P.loc = user.loc
		user.put_in_hands(P)
		to_chat(user, "<span class='notice'>You take [P] out of the [src].</span>")
	else
		to_chat(user, "<span class='notice'>[src] is empty!</span>")

	return


/obj/item/paper_bin/attackby(obj/item/I, mob/user, params)
	. = ..()

	if(istype(I, /obj/item/paper))
		if(!user.transferItemToLoc(I, src))
			return

		to_chat(user, "<span class='notice'>You put [I] in [src].</span>")
		LAZYADD(papers, I)
		amount++


/obj/item/paper_bin/examine(mob/user)
	if(amount)
		to_chat(user, "<span class='notice'>There " + (amount > 1 ? "are [amount] papers" : "is one paper") + " in the bin.</span>")
	else
		to_chat(user, "<span class='notice'>There are no papers in the bin.</span>")


/obj/item/paper_bin/update_icon()
	if(amount < 1)
		icon_state = "paper_bin0"
	else
		icon_state = "paper_bin1"
